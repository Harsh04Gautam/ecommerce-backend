import express from "express";
import {
  createUserHandler,
  forgotPasswordHandler,
  getUserHandler,
  resetPasswordHandler,
  updateUserHandler,
  verifyUserHandler,
} from "../controllers/user.controller";
import validateResource from "../middlewares/validateResource";
import {
  CreateUserSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  UpdateUserSchema,
  VerifyUserSchema,
} from "../schemas/user.schema";
import { uploadProfilePicture } from "../utils/uploadImage";

const userRouter = express.Router();
userRouter.get("/me", getUserHandler);

userRouter.patch(
  "/:id",
  validateResource(UpdateUserSchema),
  uploadProfilePicture.single("profilePicture"),
  updateUserHandler
);

userRouter.post(
  "/signup",
  validateResource(CreateUserSchema),
  uploadProfilePicture.single("profilePicture"),
  createUserHandler
);

userRouter.get(
  "/verify/:userId/:verificationCode",
  validateResource(VerifyUserSchema),
  verifyUserHandler
);

userRouter.post(
  "/forgotpassword",
  validateResource(ForgotPasswordSchema),
  forgotPasswordHandler
);

userRouter.post(
  "/resetpassword/:userId/:passwordResetCode",
  validateResource(ResetPasswordSchema),
  resetPasswordHandler
);

export default userRouter;
