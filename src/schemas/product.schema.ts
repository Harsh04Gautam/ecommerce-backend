import mongoose from "mongoose";
import z from "zod";

const Body = z.object({
  name: z
    .string({ required_error: "name is required" })
    .max(40, { message: "name can't exceed 40 characters" }),
  description: z
    .string({ required_error: "description is required" })
    .max(1000, { message: "description can't exceed 1000 characters" }),
  category: z.enum(
    ["laptop", "headphone", "phone", "tablet", "camera", "other"],
    { required_error: "category is required" }
  ),
  price: z.number({ required_error: "price is required" }),
  stock: z.number({ required_error: "stock is required" }),
  brand: z.string({ required_error: "brand is required" }),
  color: z.string({ required_error: "color is required" }),
});

const Params = z
  .object({
    id: z.string({ required_error: "parameter 'id' is required" }),
  })
  .refine((data) => mongoose.isValidObjectId(data.id));

export const CreateProductSchema = z.object({
  body: Body,
});

export const GetProductSchema = z.object({
  params: Params,
});

export const UpdateProductSchema = z.object({
  body: Body.deepPartial(),
  params: Params,
});

export const DeleteProductSchema = z.object({
  params: Params,
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type GetProductInput = z.infer<typeof GetProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type DeleteProductInput = z.infer<typeof DeleteProductSchema>;
