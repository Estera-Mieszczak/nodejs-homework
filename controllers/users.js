const User = require("../models/user");
const Joi = require("joi");

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

module.exports = {
  createUser,
};
