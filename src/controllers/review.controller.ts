import Review from "../models/review.model";
import {
  createDocumentHandler,
  deleteDocumentHandler,
  getAllDocuments,
  getDocumentById,
  updateDocumentById,
} from "./factory.controller";

export const getAllReviewsHandler = getAllDocuments(Review);
export const getReviewById = getDocumentById(Review);
export const createReviewHandler = createDocumentHandler(Review);
export const updateReviewHandler = updateDocumentById(Review);
export const deleteReviewHandler = deleteDocumentHandler(Review);
