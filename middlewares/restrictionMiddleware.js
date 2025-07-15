const appError = require("../utils/appError");

module.exports = (...roles) => {
  return (req, res, next) => {
    // check if user is admin or tour-leader

    if (!roles.includes(req.user.role)) {
      return next(new appError("You do not have permission to perform this action", 403));
    }
    next();
  };
};
