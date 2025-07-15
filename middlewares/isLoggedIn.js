const { promisify } = require("node:util");
const jwt = require("jsonwebtoken");
const User = require("../Model/userModel");

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    //  using Promisfy to convert jwt.verify to a promise-based function to use async/await syntax instead of callbacks
    //  if you don't use Promisfy or callback syntax ➡  jwt.verify becomes a blocking operation (syncronous).

    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

    if (!decoded) {
      return next();
    }

    // 1) Check if user still exists (optional, but recommended)

    const isExistingUser = await User.findById(decoded.id);
    if (!isExistingUser) {
      return next();
    }

    // 2) Check if user changed password after the token was issued (optional, but recommended)

    if (isExistingUser.checkPasswordChangedAfter(decoded.iat)) {
      return next();
    }

    // 3)
    res.locals.user = isExistingUser;
    return next();
  }
  next();
};
