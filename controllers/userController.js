const User = require("../Model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { deleteOne, updateOne, getOne, getAll } = require("./factoryHandler");

exports.getAllUsers = getAll(User);
exports.getUser = getOne(User);
exports.updateUser = updateOne(User);
exports.deleteUser = deleteOne(User);

exports.updateMyData = catchAsync(async (req, res, next) => {
  // TODO 1) check if user want change password

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('if you want to change password go to "/updatepassword" ', 400)
    );
  }

  // TODO 2) check if user want to change it's role  which isn't his responsability

  if (req.body.role) {
    return next(new AppError("you don't have permession to change your role ", 403));
  }

  // TODO 3) update user data

  const { _id } = req.user;
  const { name, email } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    { name, email },
    { new: true, runValidators: true }
  ).select("-password");

  if (!updatedUser) {
    return next(new AppError("user doesn't exist or input data is invalid ", 404));
  }

  res.status(200).json({
    status: "succeed",
    updatedUser,
  });
});

exports.deActivateUser = catchAsync(async (req, res, next) => {
  // TODO 1) get user id from
  const { _id } = req.user;

  const deActivatedUser = await User.findByIdAndUpdate(
    _id,
    { active: false },
    { new: true, runValidators: true }
  ).select("-password");

  if (!deActivatedUser) {
    return next(new AppError("user doesn't exist or input data is invalid ", 404));
  }
  res.status(204).json({
    status: "succeed",
    data: null,
  });
});
