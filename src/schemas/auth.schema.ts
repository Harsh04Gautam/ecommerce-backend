import z from "zod";

export const LoginUserSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "email is required" })
      .email("invaid email or password"),
    password: z
      .string({ required_error: "password is required" })
      .min(6, { message: "invaid email or password" }),
  }),
});

export type LoginUserInput = z.infer<typeof LoginUserSchema>;
