import Product from "../models/product.model";
import {
  createDocumentHandler,
  deleteDocumentHandler,
  getAllDocuments,
  getDocumentById,
  updateDocumentById,
} from "./factory.controller";

export const getAllProductsHandler = getAllDocuments(Product);
export const getProductHandler = getDocumentById(Product);
export const createProductHandler = createDocumentHandler(Product);
export const updateProductHandler = updateDocumentById(Product);
export const deleteProductHandler = deleteDocumentHandler(Product);
