const AppError = require("../utils/appError");

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendProdError = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

const handleMongooseErrors = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleExpiredToken = (err) => {
  return new AppError("Your token has expired! Please log in again.", 401);
};

const handleJwtErrors = (err) => {
  return new AppError("Invalid token !", 401);
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = err;

    if (error.name === "CastError") error = handleMongooseErrors(error);
    if (error.name === "TokenExpiredError") error = handleExpiredToken(error);
    if (error.name === "JsonWebTokenError") error = handleJwtErrors(error);
    sendProdError(error, res);
  }
};
