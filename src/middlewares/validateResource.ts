import z from "zod";
import catchAsync from "../utils/catchAsync";

const validateResource = (Schema: z.AnyZodObject) =>
  catchAsync(async (req, _res, next) => {
    await Schema.parseAsync({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    next();
  });

export default validateResource;
