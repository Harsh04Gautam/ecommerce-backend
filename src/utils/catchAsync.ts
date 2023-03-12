import { NextFunction, Request, Response } from "express";

const catchAsync =
  <TParams = {}, TBody = {}, TQuery = {}>(
    fn: (
      req: Request<TParams, {}, TBody, TQuery>,
      res: Response,
      next: NextFunction
    ) => Promise<unknown>
  ) =>
  (
    req: Request<TParams, any, TBody, TQuery>,
    res: Response,
    next: NextFunction
  ) => {
    return fn(req, res, next).catch(next);
  };

export default catchAsync;
