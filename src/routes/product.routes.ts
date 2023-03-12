import express from "express";
import {
  createProductHandler,
  deleteProductHandler,
  getAllProductsHandler,
  getProductHandler,
  updateProductHandler,
} from "../controllers/product.controller";
import validateResource from "../middlewares/validateResource";
import {
  CreateProductSchema,
  DeleteProductSchema,
  GetProductSchema,
  UpdateProductSchema,
} from "../schemas/product.schema";
import { uploadProductImage } from "../utils/uploadImage";
import reviewRouter from "./review.routes";

const productRouter = express.Router();

productRouter.use("/:productId/reviews", reviewRouter);

productRouter
  .route("/")
  .get(getAllProductsHandler)
  .post(validateResource(CreateProductSchema), createProductHandler);

productRouter
  .route("/:id")
  .get(validateResource(GetProductSchema), getProductHandler)
  .patch(
    validateResource(UpdateProductSchema),
    uploadProductImage.single("image"),
    updateProductHandler
  )
  .delete(validateResource(DeleteProductSchema), deleteProductHandler);

export default productRouter;
