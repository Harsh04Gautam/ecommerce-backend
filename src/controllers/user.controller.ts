import User from "../models/user.model";
import {
  VerifyUserInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../schemas/user.schema";
import catchAsync from "../utils/catchAsync";
import {
  createDocumentHandler,
  updateDocumentById,
} from "./factory.controller";
import AppError from "../utils/AppError";
import { signJwt } from "../utils/jwt";
import _ from "lodash";
import logger from "../utils/logger";
import { sendResetPasswordMail } from "../utils/mailer";
import { v4 as uuid } from "uuid";

export const createUserHandler = createDocumentHandler(User);
export const updateUserHandler = updateDocumentById(User);

export const getUserHandler = catchAsync(async (_req, res, next) => {
  if (!res.locals.user) return next(new AppError("please login", 403));
  res.status(200).json({
    status: "success",
    data: {
      user: res.locals.user,
    },
  });
});

export const verifyUserHandler = catchAsync<VerifyUserInput["params"]>(
  async (req, res, next) => {
    const { userId, verificationCode } = req.params;
    const genericMessage = "could not verify user";
    const user = await User.findById(userId);
    if (!user) return next(new AppError(genericMessage, 400));

    if (user.verified)
      return res
        .status(200)
        .json({ status: "success", message: "user already verified" });

    if (!user.verificationCode || user.verificationCode !== verificationCode)
      return next(new AppError(genericMessage, 400));

    user.verificationCode = null;
    user.verified = true;
    await user.save();

    const accessToken = await signJwt(user, "access");
    const refreshToken = await signJwt(user, "refresh");

    if (!accessToken || !refreshToken)
      return next(
        new AppError("failed to create token, please try again later", 500)
      );

    const cookieOptions = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      secure: false,
      httpOnly: true,
    };

    if (process.env.NODE_ENV === "production") {
      cookieOptions.secure = true;
    }

    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.cookie("accessToken", accessToken);
    res.redirect("http://localhost:5173");
  }
);

export const forgotPasswordHandler = catchAsync<
  {},
  ForgotPasswordInput["body"]
>(async (req, res, next) => {
  const { email } = req.body;
  const genericMessage = `if user with email: ${email} is verified, it will receive a mail`;
  const user = await User.findOne({ email });

  if (!user) {
    logger.error(`user with email: ${email} dose not exist`);
    return res.send(genericMessage);
  }

  if (!user.verified)
    return next(new AppError("please verify your account", 400));

  const passwordResetCode = uuid();
  user.passwordResetCode = passwordResetCode;
  user.save();

  await sendResetPasswordMail({
    id: user.id,
    email: user.email,
    passwordResetCode,
  });

  res.send(genericMessage);
});

export const resetPasswordHandler = catchAsync<
  ResetPasswordInput["params"],
  ResetPasswordInput["body"]
>(async (req, res, next) => {
  const genericMessage = "could not reset password";
  const { password } = req.body;
  const { userId, passwordResetCode } = req.params;
  const user = await User.findById(userId);

  if (
    !user ||
    !user.verified ||
    !user.passwordResetCode ||
    user.passwordResetCode !== passwordResetCode
  )
    return next(new AppError(genericMessage, 400));

  user.password = password;
  user.passwordResetCode = null;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "password reset successfully",
  });
});
