import express from "express";
import {
  createReviewHandler,
  deleteReviewHandler,
  getAllReviewsHandler,
  getReviewById,
  updateReviewHandler,
} from "../controllers/review.controller";
import validateResource from "../middlewares/validateResource";
import {
  CreateReviewSchema,
  DeleteReviewSchema,
  GetAllReviewsSchema,
  GetReviewSchema,
  UpdateReviewSchema,
} from "../schemas/review.schema";

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter
  .route("/")
  .get(validateResource(GetAllReviewsSchema), getAllReviewsHandler)
  .post(validateResource(CreateReviewSchema), createReviewHandler);

reviewRouter
  .route("/:id")
  .get(validateResource(GetReviewSchema), getReviewById)
  .patch(validateResource(UpdateReviewSchema), updateReviewHandler)
  .delete(validateResource(DeleteReviewSchema), deleteReviewHandler);

export default reviewRouter;
