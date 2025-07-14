const User = require("../Model/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendMail");
const crypto = require("crypto");
const usableRes = require("../utils/usableRes");
// ? Signup function to create a new user
exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;
  const newUser = await User.create({
    // to prevent user from sending unwanted data, we can use destructuring and rest operator
    name,
    email,
    password,
    passwordConfirm,
    role,
  });
  if (!newUser) {
    return next(new AppError("please provide a valid user data", 400));
  }
  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

// ? Login function to authenticate a user
exports.login = catchAsync(async (req, res, next) => {
  // TODO 1) Check if user exists in the database
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password"); // Select the password field to compare it later

  if (!user) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // TODO 2) Check if password is correct
  const isPasswordCorrect = await user.correctPassword(password, user.password);
  if (!isPasswordCorrect) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // TODO 3) If everything is ok, send token
  await usableRes(res, 200, "success", user);
  /* token = await generateToken(user);
  res.status(200).json({
    status: "success",
    token,
  }); */
});

// ? Forgot password function to handle password reset requests
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  // TODO 1) Get user based on POSTed email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("There is no user with this email address.", 404));
  }

  // TODO 2) Generate a reset token and save it to the user document
  const resetToken = user.createPasswordResetToken();

  user.save({ validateBeforeSave: false }); // Save the user with the reset token without validation

  // TODO 3) Create a reset URL
  const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetpassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and
                       passwordConfirm to: ${resetURL}.
                      \nIf you didn't forget your password, please ignore this email!`;

  try {
    // TODO 4) Send it to the user
    await sendEmail({
      email,
      subject: "Your password reset token (valid for 10 min)",
      resetToken, // Pass the reset token to the email function
      url: resetURL, // Pass the reset URL to the email function
    }); // Send the email with the reset token and URL

    res.status(200).json({
      status: "success",
      message: " Reset Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined; // Clear the reset token
    user.passwordResetExpires = undefined; // Clear the expiration time
    await user.save({ validateBeforeSave: false }); // Save the user without validation

    return next(new AppError("There was an error sending the email. Try again later!", 500));
  }
});

// ? Reset password function to update the user's password using the reset token
exports.resetPassword = catchAsync(async (req, res, next) => {
  // TODo 1) Get the token from the URL parameters
  const { token } = req.params;

  const { password, passwordConfirm } = req.body; // Get the new password and confirm password from the request body

  const hashedToken = crypto.createHash("sha256").update(token.toString()).digest("hex");

  // TODO 2) Find the user by the reset token and check if it hasn't expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // Check if the token is still valid
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  // TODO 3) Update the user's password and clear the reset token and expiration time
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); // Save the updated user document

  // TODO 4) Generate a new token for the user

  await usableRes(res, 200, "success", user);

  /* const newToken = await generateToken(user);

  res.status(200).json({
    status: "success",
    token: newToken, // Return the new token in the response
  }); */
});

// ? Update password function to change the user's password

exports.updatePassword = catchAsync(async (req, res, next) => {
  // TODO 1) get user

  const { _id } = req.user;
  const user = await User.findById(_id).select("+password");

  // TODO 2) check current user is correct

  const isCorrect = await user.correctPassword(req.body.currentPassword, user.password);
  if (!isCorrect) {
    return next(new AppError("please enter your current password", 401));
  }

  // TODO 3) then update password if so

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // TODO 4) then login user and send new token
  await usableRes(res, 200, "success", user);

  /* token = await generateToken(user);
  res.status(200).json({
    status: "success",
    token,
  }); */
});
