import mongoose from "mongoose";
import z from "zod";

const comparePasswords = (data: {
  password: string;
  passwordConfirmation: string;
}): boolean => data.password === data.passwordConfirmation;

const Body = z.object({
  name: z.string({ required_error: "name is required" }).max(40),
  email: z
    .string({ required_error: "email is required" })
    .email("please enter a valid email"),
  password: z
    .string({ required_error: "password is required" })
    .min(6, { message: "password must contain at least six characters" }),
  passwordConfirmation: z.string({
    required_error: "password confirmation is required",
  }),
});

const Params = z
  .object({
    id: z.string({ required_error: "parameter 'id' is required" }),
  })
  .refine((data) => mongoose.isValidObjectId(data.id), {
    message: "please provide a valid 'id'",
  });

export const CreateUserSchema = z.object({
  body: Body.refine(comparePasswords, { message: "passwords do not match" }),
});

export const UpdateUserSchema = z.object({
  body: Body.omit({ password: true, passwordConfirmation: true }).deepPartial(),
  params: Params,
});

export const VerifyUserSchema = z.object({
  params: z
    .object({
      userId: z.string({ required_error: "parameter 'userId' is required" }),
      verificationCode: z.string({
        required_error: "parameter 'verificationCode' is required",
      }),
    })
    .refine((data) => mongoose.isValidObjectId(data.userId)),
});

export const ForgotPasswordSchema = z.object({
  body: Body.pick({ email: true }),
});

export const ResetPasswordSchema = z.object({
  body: Body.pick({ password: true, passwordConfirmation: true }).refine(
    comparePasswords,
    { message: "passwords do not match" }
  ),
  params: z
    .object({
      userId: z.string({ required_error: "parameter 'userId' is required" }),
      passwordResetCode: z.string({
        required_error: "parameter 'passwordResetCode' is required",
      }),
    })
    .refine((data) => mongoose.isValidObjectId(data.userId)),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type VerifyUserInput = z.infer<typeof VerifyUserSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
