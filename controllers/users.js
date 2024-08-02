const User = require("../models/user");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { findUserById } = require("./services");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const { v4: uuidV4 } = require("uuid");
const { isImageAndTransform } = require("../functions/functions");

require("dotenv").config();

const { SECRET } = process.env;

const userSchema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "pl"] },
    })
    .required(),
  password: Joi.string().min(3).max(25).required(),
});

const createUser = async (req, res, next) => {
  const { error, value } = userSchema.validate(req.body);

  if (error) {
    console.log(error);
    return res.send("Invalid request");
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email }).lean();
  if (user) {
    return res.status(409).json({ message: "This email is already taken" });
  }
  try {
    const generateAvatarURL = gravatar.url(email, {
      s: "250",
      r: "pg",
      d: "404",
    });
    console.log(generateAvatarURL);
    const newUser = new User({ email, avatarURL: generateAvatarURL });
    await newUser.setPassword(password);
    await newUser.save();
    return res.status(201).json({ message: "Account created" });
  } catch (err) {
    next(err);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Email is wrong" });
  }
  const isPasswordCorrect = await user.validatePassword(password);

  if (isPasswordCorrect) {
    const payload = {
      id: user._id,
    };
    const token = jwt.sign(payload, SECRET, { expiresIn: "12h" });
    user.token = token;
    user.save();
    return res.json({ token });
  } else {
    return res.status(401).json({ message: "Password is wrong" });
  }
};

const logoutUser = async (req, res, next) => {
  const { _id } = req.user;

  try {
    const user = await findUserById(_id);
    user.token = null;
    user.save();

    return res.status(200).json({ message: "Logged out" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  const { _id: id } = req.user;

  try {
    const user = await findUserById(id);

    if (!user) {
      res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json({ message: `${user}` });
  } catch (error) {
    console.log(error);
    next();
  }
};

const updateAvatar = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "File is not a photo" });
  }

  const storageAvatarDir = path.join(process.cwd(), "public/avatars");

  const { path: temporaryPath } = req.file;
  const extension = path.extname(temporaryPath);
  const fileName = `${uuidV4()}${extension}`;
  const filePath = path.join(storageAvatarDir, fileName);

  console.log(`Temp Path: ${temporaryPath}`);
  console.log(`Storage Avatar Dir: ${storageAvatarDir}`);

  try {
    await fs.rename(temporaryPath, filePath);
  } catch (e) {
    await fs.unlink(temporaryPath);
    return next(e);
  }
  const isValidAndTransform = await isImageAndTransform(filePath);
  if (!isValidAndTransform) {
    await fs.unlink(filePath);
    return res.status(400).json({ message: "Isnt a photo but pretending" });
  }
  const newAvatarURL = `/avatars/${fileName}`;
  req.user.avatarURL = newAvatarURL;
  req.user.save();
  res.redirect(`/avatars/${fileName}`);
};

module.exports = {
  createUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateAvatar,
};
