import mongoose from "mongoose";
import { CreateReviewInput } from "../schemas/review.schema";
import Product from "./product.model";

type TReview = CreateReviewInput["body"] & {
  product: mongoose.ObjectId;
  user: mongoose.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const reviewSchema = new mongoose.Schema<TReview>(
  {
    ratings: Number,
    description: String,
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ user: 1, product: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name",
  });
  next();
});

reviewSchema.statics.calculateAverageRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "product",
        numberOfRatings: { $sum: 1 },
        averageRating: { $avg: "$ratings" },
      },
    },
  ]);

  if (stats.length <= 0)
    return await Product.findByIdAndUpdate(productId, {
      ratingsQuentity: 0,
      averageRating: 0,
    });

  await Product.findByIdAndUpdate(productId, {
    ratingsQuentity: stats[0].numberOfRatings,
    averageRating: stats[0].averageRating,
  });
};

reviewSchema.post("save", function () {
  //@ts-ignore
  this.constructor.calculateAverageRating(this.product);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  //@ts-ignore
  this.tempReview = await this.findOne().clone();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  //@ts-ignore
  await this.tempReview.constructor.calculateAverageRating(
    //@ts-ignore
    this.tempReview.product
  );
});

const Review = mongoose.model<TReview>("Review", reviewSchema);

export default Review;
