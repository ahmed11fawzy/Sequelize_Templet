const Tour = require("../Model/tourModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const calcRadiusInRadian = require("../utils/calcRadiusInRadian");
const { deleteOne, updateOne, createOne, getOne, getAll } = require("./factoryHandler");

exports.getAllTours = getAll(Tour);
exports.createTour = createOne(Tour);
exports.getTour = getOne(Tour, "reviews");
exports.updateTour = updateOne(Tour);
exports.deleteTour = deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gt: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        ratingsAverage: { $avg: "$ratingsAverage" },
        numTours: { $sum: 1 },
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    results: stats.length,
    data: {
      stats,
    },
  });
});

exports.getYerlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  if (year < new Date().getFullYear()) {
    return next(new AppError("Year must be above 2019 and less than current year ", 400));
  }
  const MonthStats = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $sort: { month: 1 },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    results: MonthStats.length,
    data: {
      MonthStats,
    },
  });
});

exports.getToursWithinDistance = catchAsync(async (req, res, next) => {
  const { distance, location, unit } = req.params;
  const radius = calcRadiusInRadian(distance, unit);
  const [lat, lng] = location.split(",");
  if (!lat || !lng) {
    return next(new AppError("Please provide latitude and longitude in the format lat,lng", 400));
  }
  // { $centerSphere: [ [ <x>, <y> ], <radius>"in radians unit " ] }
  const geoSphare = {
    $centerSphere: [[lng, lat], radius],
  };

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: geoSphare,
    },
  });

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { location } = req.params;
  const [lat, lng] = location.split(",");
  if (!lat || !lng) {
    return next(new AppError("Please provide latitude and longitude in the format lat,lng", 400));
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: 0.001,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    results: distances.length,
    data: {
      distances,
    },
  });
});
