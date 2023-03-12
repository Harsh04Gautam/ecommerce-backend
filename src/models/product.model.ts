import mongoose from "mongoose";
import { CreateProductInput } from "../schemas/product.schema";

type TProduct = CreateProductInput["body"] & {
  image: string;
  reviews: unknown[];
  averageRating: number;
  ratingsQuentity: number;
  createdAt: Date;
  updatedAt: Date;
};

type TProductMethods = {};

type TProductModel = mongoose.Model<TProduct, {}, TProductMethods>;

const productSchema = new mongoose.Schema<
  TProduct,
  TProductModel,
  TProductMethods
>(
  {
    name: String,
    description: String,
    category: String,
    price: Number,
    stock: Number,
    brand: String,
    color: String,
    image: String,
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      set: (value: number) => Math.round(value * 10) / 10,
    },
    ratingsQuentity: Number,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ name: 1 });
productSchema.index({ price: 1 });

productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
});

const Product = mongoose.model<TProduct, TProductModel>(
  "Product",
  productSchema
);

export default Product;
