const User = require("../Model/userModel");
const AppError = require("../utils/appError");

module.exports = async (req, res, next) => {
    const { email, password } = req.body;
    // Check if email and password are provided
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }
    next();
}