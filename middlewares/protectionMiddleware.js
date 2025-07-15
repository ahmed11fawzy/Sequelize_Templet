const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../Model/userModel"); // Assuming you have a User model defined
module.exports = async (req, res, next) => {
  let token;
  //  1) Check if token is provided in the headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]; // Extract the token from the header
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else {
    return next(new AppError("You are not logged in ! Please log in to get access.", 401));
  }

  // 2) Verify token

  //  using Promisfy to convert jwt.verify to a promise-based function to use async/await syntax instead of callbacks
  //  if you don't use Promisfy or callback syntax ➡  jwt.verify becomes a blocking operation (syncronous).

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  if (!decoded) {
    return next(new AppError("Invalid token! Please log in again.", 401));
  }

  // 3) Check if user still exists (optional, but recommended)

  const isExistingUser = await User.findById(decoded.id);
  if (!isExistingUser) {
    return next(new AppError("The user belonging to this token no longer exists.", 401));
  }

  // 4) Check if user changed password after the token was issued (optional, but recommended)

  if (isExistingUser.checkPasswordChangedAfter(decoded.iat)) {
    return next(new AppError("User recently changed password! Please log in again.", 401));
  }

  // 5) Grant access to the protected route by attaching user to the request object
  req.user = isExistingUser;

  next();
};
