const Tour = require("../Model/tourModel");
const catchAsync = require("../utils/catchAsync");
exports.overview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTour = catchAsync(async (req, res) => {
  const slug = req.params.slug;
  const tour = await Tour.findOne({ slug: slug }).populate({
    path: "reviews",
    select: "rating review user ",
  });
  res.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render("login");
});
