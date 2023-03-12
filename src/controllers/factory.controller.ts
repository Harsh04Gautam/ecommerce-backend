import User from "../models/user.model";
import catchAsync from "../utils/catchAsync";
import _ from "lodash";
import { sendVerificationMail } from "../utils/mailer";
import fs from "fs/promises";
import logger from "../utils/logger";
import mongoose from "mongoose";
import Product from "../models/product.model";
import ApiFeatures from "../utils/ApiFeatures";
import AppError from "../utils/AppError";
import Review from "../models/review.model";
import path from "path";

export const getAllDocuments = (DocumentModel: mongoose.Model<any>) =>
  catchAsync(async (req, res, _next) => {
    const documentName = DocumentModel.modelName.toLowerCase();
    let documentPromise;
    const filter: { product?: string } = {};

    if (Object.keys(req.query).length !== 0) {
      if ("productId" in req.params && typeof req.params.productId === "string")
        filter.product = req.params.productId;

      documentPromise = new ApiFeatures(DocumentModel.find(filter), req.query)
        .filter()
        .searchByName()
        .sort()
        .pagination()
        .limitFields().queryPromise;

      DocumentModel === Review && documentPromise.populate("product");
    } else {
      documentPromise = DocumentModel.find();
    }

    const document = await documentPromise;
    const result = document instanceof Array ? document.length : 0;

    res.status(200).json({
      status: "success",
      result,
      data: {
        [documentName]: document,
      },
    });
  });

export const getDocumentById = (DocumentModel: mongoose.Model<any>) =>
  catchAsync<{ id: string }>(async (req, res, next) => {
    const documentName = DocumentModel.modelName.toLowerCase();
    const document =
      DocumentModel === Product
        ? await DocumentModel.findById(req.params.id).populate("reviews")
        : await DocumentModel.findById(req.params.id);

    if (!document)
      return next(
        new AppError(
          `${documentName} with id: ${req.params.id} dose not exist`,
          404
        )
      );

    res.status(200).json({
      status: "success",
      [documentName]: document,
    });
  });

export const createDocumentHandler = (DocumentModel: mongoose.Model<any>) =>
  catchAsync<
    object,
    object & Record<"product", string> & Record<"user", object>
  >(async (req, res, _next) => {
    if (
      DocumentModel === Review &&
      "productId" in req.params &&
      typeof req.params.productId === "string" &&
      "user" in res.locals &&
      typeof res.locals.user === "object"
    ) {
      req.body.product = req.params.productId;
      req.body.user = res.locals.user?._id;
    }

    const documentName = DocumentModel.modelName.toLowerCase();
    const document = await DocumentModel.create(req.body);

    if (document instanceof User) {
      if (req.file) {
        document.profilePicture = req.file.path;
        document.save();
      }
      await sendVerificationMail({
        id: document.id,
        email: document.email,
        verificationCode: document.verificationCode as string,
      });
    }

    if (document instanceof Product && req.file) {
      document.image = req.file.path;
      document.save();
    }

    res.status(201).json({
      status: "success",
      message: `${documentName} created successfully`,
    });
  });

export const updateDocumentById = (DocumentModel: mongoose.Model<any>) =>
  catchAsync<{ id: string }>(async (req, res, next) => {
    const documentName = DocumentModel.modelName.toLowerCase();
    const document = await DocumentModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!document)
      return next(
        new AppError(
          `${documentName} with id ${req.params.id} does not exist`,
          400
        )
      );
    if (document instanceof User && req.file) {
      if (document.profilePicture) {
        const previosResourcePath = path.join(
          process.cwd(),
          "uploads",
          document.profilePicture
        );
        try {
          await fs.unlink(previosResourcePath);
        } catch (err) {
          logger.error("failed to delete profilePicture of user");
        }
      }
      document.profilePicture = req.file.path.replace("uploads", "");
      document.save();
    }

    if (document instanceof Product && req.file) {
      if (document.image) {
        const previosResourcePath = path.join(
          process.cwd(),
          "uploads",
          document.image
        );
        try {
          await fs.unlink(previosResourcePath);
        } catch (err) {
          logger.error("failed to delete image of product");
        }
      }
      document.image = req.file.path.replace("uploads", "");
      document.save();
    }

    res.status(200).json({
      status: "success",
      message: `${documentName} updated successfully`,
    });
  });

export const deleteDocumentHandler = (DocumentModel: mongoose.Model<any>) =>
  catchAsync<{ id: string }>(async (req, res, next) => {
    const documentName = DocumentModel.modelName.toLowerCase();
    const document = await DocumentModel.findByIdAndDelete(req.params.id);

    if (!document)
      return next(
        new AppError(
          `${documentName} with id: ${req.params.id} dose not exist`,
          404
        )
      );

    if (document instanceof User && document.profilePicture) {
      const previosResourcePath = path.join(
        process.cwd(),
        "uploads",
        document.profilePicture
      );
      try {
        await fs.unlink(path.join(previosResourcePath));
      } catch (err) {
        logger.error("failed to delete profilePicture of user");
      }
    }

    if (document instanceof Product && document.image) {
      const previosResourcePath = path.join(
        process.cwd(),
        "uploads",
        document.image
      );
      try {
        await fs.unlink(path.join(previosResourcePath));
      } catch (err) {
        logger.error("failed to delete image of product");
      }
    }

    res.status(204).json({
      status: "success",
      message: `${documentName} deleted successfully`,
    });
  });
