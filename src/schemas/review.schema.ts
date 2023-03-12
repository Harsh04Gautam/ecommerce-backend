import mongoose from "mongoose";
import z from "zod";

const Body = z.object({
  ratings: z
    .number({ required_error: "ratings is required" })
    .min(0, { message: "can't rate below 0" })
    .max(5, { message: "can't rate above 5" }),
  description: z
    .string()
    .max(500, { message: "description can't exceed 500 characters" })
    .optional(),
});

const Params = z
  .object({
    productId: z.string({
      required_error: "parameter 'productId' is required",
    }),
  })
  .refine((data) => mongoose.isValidObjectId(data.productId));

export const CreateReviewSchema = z.object({
  body: Body,
  params: Params,
});

export const GetAllReviewsSchema = z
  .object({
    body: Body.extend({
      user: z.string(),
      product: z.string(),
    }),
    params: z.object({
      productId: z.string().optional(),
    }),
  })
  .deepPartial();

export const GetReviewSchema = z.object({
  params: z
    .object({
      id: z.string({ required_error: "parameter 'id' is required" }),
    })
    .refine((data) => mongoose.isValidObjectId(data.id)),
});

export const UpdateReviewSchema = z.object({
  body: Body.deepPartial(),
  params: z
    .object({
      id: z.string({ required_error: "parameter 'id' is required" }),
    })
    .refine((data) => mongoose.isValidObjectId(data.id)),
});

export const DeleteReviewSchema = z.object({
  params: z
    .object({
      id: z.string({ required_error: "parameter 'id' is required" }),
    })
    .refine((data) => mongoose.isValidObjectId(data.id)),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type GetAllReviewsInput = z.infer<typeof GetAllReviewsSchema>;
export type GetReviewInput = z.infer<typeof GetReviewSchema>;
export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>;
export type DeleteReviewInput = z.infer<typeof DeleteReviewSchema>;
