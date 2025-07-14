const generateToken = require("./generateToken");

const cookieOptions = {
  expires: new Date(Date.now() + 60 * 60 * 1000),
  httpOnly: true,
};
module.exports = async (res, statusCode, status, user) => {
  // TODO 1) generate token
  token = await generateToken(user);

  // TODO 2) send token via cookie

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  res.cookie("jwt", token, cookieOptions);
  // TODO 3) send response
  res.status(statusCode).json({
    status,
    token,
  });
};
