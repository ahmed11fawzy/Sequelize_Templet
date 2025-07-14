class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // 1) Filtering

  filter() {
    // 1A) Filtering
    const reqQuery = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete reqQuery[el]);

    // 1B) Advanced Filtering
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query.find(JSON.parse(queryStr));

    return this;
  }

  // 2) Sorting
  sort() {
    if (this.queryString.sort) {
      console.log(
        "🚀 ~ ApiFeatures ~ sort ~ this.queryString.sort:",
        this.queryString.sort
      );
      let sortBy;
      // TODO 1) check if query param is douplicated then get last one
      if (Array.isArray(this.queryString.sort)) {
        const newQuery = this.queryString.sort[this.queryString.sort.length - 1];
        console.log("🚀 ~ ApiFeatures ~ sort ~ newQuery:", newQuery);
        sortBy = newQuery.split(",").join(" ");
        console.log("🚀 ~ ApiFeatures ~ sort ~ sortBy:", sortBy);
      } else {
        // Keep all other params as they are
        sortBy = this.queryString.sort.split(",").join(" ");
      }
      this.query = this.query.sort(sortBy);
    } else {
      this.query.sort("-createdAt");
    }
    return this;
  }

  // 3) Field limiting
  limit() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  // 4) Pagination
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeatures;
