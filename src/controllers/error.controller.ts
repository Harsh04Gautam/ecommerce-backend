import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import _ from "lodash";
import logger from "../utils/logger";
import { ZodError } from "zod";
import mongoose from "mongoose";

type Err = Record<"status", "error" | "fail"> &
  Record<"statusCode", number> &
  (Error | AppError);

const handleDevError = (error: Err, res: Response) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stack: error.stack,
    error,
  });
};

const handleProdError = (error: Err, res: Response) => {
  if ("isOperational" in error && error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    logger.error("unknown error");
    logger.error(JSON.stringify(error));
    res.status(500).json({
      status: "error",
      message: "something went wrong",
    });
  }
};

const handleZodError = (error: ZodError) => {
  const message = error.issues.map((issue) => issue.message).join(". ");
  return new AppError(message, 400);
};

const isCastError = (error: object): error is mongoose.CastError => {
  return "name" in error && error.name === "CastError";
};

const handleCastError = (error: mongoose.CastError) => {
  const message = `invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

const handleDuplicateKeyError = (error: Err) => {
  const fields = "keyValue" in error && JSON.stringify(error.keyValue);
  const message = fields
    ? `duplicate field ${fields}, please provide different values`
    : "please provide different values";
  return new AppError(message, 400);
};

export const globalErrorHandler = (
  err: Err,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") handleDevError(err, res);
  if (process.env.NODE_ENV === "production") {
    if (err instanceof ZodError) err = handleZodError(err);
    if (isCastError(err)) err = handleCastError(err);
    if ("code" in err && err.code === 11000) err = handleDuplicateKeyError(err);
    handleProdError(err, res);
  }
};
