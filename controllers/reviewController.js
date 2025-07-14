const Review = require("../Model/reviewModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { deleteOne, updateOne, createOne, getOne, getAll } = require("./factoryHandler");

exports.getAllReviews = getAll(Review);

exports.getReview = getOne(Review);

exports.createReview = createOne(Review);

exports.updateReview = updateOne(Review);

exports.deleteReview = deleteOne(Review);
