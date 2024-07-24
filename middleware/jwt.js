const passport = require("passport");
const strategy = require("../config/jwt");

passport.use(strategy);

const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user || err) {
      return res.status(401).json({ message: "Not authorized" });
    }
    res.locals.user = user;
    next();
  })(req, res, next);
};
module.exports = auth;
