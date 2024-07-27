const User = require("../models/user");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { findUserById, updateUserById } = require("./services");
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
  const user = await User.findOne({ email }, { _id: 1 }).lean();
  if (user) {
    return res.status(409).json({ message: "This email is already taken" });
  }
  try {
    const newUser = new User({ email });
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

    if (user.token !== null) {
      await updateUserById(_id, { token: null });
    }
    return res.status(200).json({ message: "Logged out" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  const { _id: id } = req.user;
  console.log(req.user);

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

module.exports = {
  createUser,
  loginUser,
  logoutUser,
  getCurrentUser,
};
