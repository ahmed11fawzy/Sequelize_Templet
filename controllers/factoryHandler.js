const ApiFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    /* const reqQuery = {...req.query};
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete reqQuery[el]);
    // 1) Filtering
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr))
    let query = Tour.find(JSON.parse(queryStr));
    // 2) Sorting
    if(req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      console.log(sortBy);
      query = query.sort(sortBy);
    }else {
      query.sort('-createdAt');
    }
    // 3) Field limiting
    if(req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields); 
    }else {
      query = query.select('-__v');
    }

    // 4) Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit); */

    // ? used for enable nested params form tours to get reviews
    let getOnly = {};
    if (req.params.tourId) getOnly.tour = req.params.tourId;

    // using the APIFeatures class to filter, sort, limit and paginate the data
    const apiFeatures = new ApiFeatures(Model.find(getOnly), req.query).filter().sort().limit().paginate();
    const doc = await apiFeatures.query;
    res.status(200).json({
      status: "success",
      count: doc.length,
      data: {
        data: doc,
      },
    });
  });
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });
exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
};

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });
