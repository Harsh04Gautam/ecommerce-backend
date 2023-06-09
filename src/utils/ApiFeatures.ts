import mongoose from "mongoose";
import _ from "lodash";

class ApiFeatures {
  constructor(
    readonly queryPromise: mongoose.Query<unknown, unknown>,
    readonly queryObject: object
  ) {
    this.queryPromise = queryPromise;
    this.queryObject = queryObject;
  }

  searchByName(): this {
    if ("name" in this.queryObject && typeof this.queryObject.name === "string")
      this.queryPromise.find({
        name: { $regex: this.queryObject.name, $options: "i" },
      });
    return this;
  }

  filter(): this {
    const excludedFields = ["page", "limit", "sort", "fields"];
    let queryObject = _.omit(this.queryObject, excludedFields);

    // replace "operator" with "$operator", example "gte" -> "$gte"
    queryObject = JSON.parse(
      JSON.stringify(queryObject).replace(
        /\b(gt|gte|lt|lte)\b/g,
        (operator) => `$${operator}`
      )
    );
    this.queryPromise.find(queryObject);

    return this;
  }

  limitFields(): this {
    if (
      !("fields" in this.queryObject) ||
      typeof this.queryObject.fields !== "string"
    )
      return this;

    const selectedFields = this.queryObject.fields.split(",").join(" ");
    this.queryPromise.select(selectedFields);

    return this;
  }

  sort(): this {
    if (!("sort" in this.queryObject)) {
      this.queryPromise.sort("createdAt");
      return this;
    }
    if (typeof this.queryObject.sort === "string") {
      const sortBy = this.queryObject.sort.split(",").join(" ");
      this.queryPromise.sort(sortBy);
    }

    return this;
  }

  pagination(): this {
    const page = "page" in this.queryObject ? Number(this.queryObject.page) : 1;
    const limit =
      "limit" in this.queryObject ? Number(this.queryObject.limit) : 4;
    const skip = (page - 1) * limit;
    this.queryPromise.skip(skip).limit(limit);

    return this;
  }
}

export default ApiFeatures;
