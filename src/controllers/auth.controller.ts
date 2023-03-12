import User from "../models/user.model";
import { LoginUserInput } from "../schemas/auth.schema";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";
import { signJwt, verifyJwt } from "../utils/jwt";
import _ from "lodash";
import Session from "../models/session.model";

const cookieOptions = {
  expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  secure: false,
  httpOnly: true,
};

if (process.env.NODE_ENV === "production") {
  cookieOptions.secure = true;
}

export const loginUserHandler = catchAsync<{}, LoginUserInput["body"]>(
  async (req, res, next) => {
    const genericMessage = "failed to login";
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return next(new AppError(genericMessage, 400));
    if (!user.verified)
      return next(new AppError("please verify your account", 400));

    const valid = await user.comparePasswords(password, user.password);
    if (!valid) return next(new AppError(genericMessage, 400));

    const accessToken = await signJwt(user, "access");
    const refreshToken = await signJwt(user, "refresh");

    if (!accessToken || !refreshToken)
      return next(
        new AppError("failed to create token, please try again later", 500)
      );

    res.cookie("refreshToken", refreshToken, cookieOptions);
    // res.cookie("accessToken", accessToken, cookieOptions);

    res.status(200).json({
      status: "success",
      data: {
        accessToken,
      },
    });
  }
);

export const refreshTokenHandler = catchAsync(async (req, res, next) => {
  const genericMessage = "could not refresh access token";

  if (
    !(
      req?.cookies?.refreshToken && typeof req.cookies.refreshToken === "string"
    )
  )
    return next(new AppError(genericMessage, 400));

  const refreshToken = req.cookies.refreshToken as string;

  const decoaded = await verifyJwt<{ sessionId: string }>(
    refreshToken,
    "refresh"
  );

  if (!decoaded) return next(new AppError(genericMessage, 400));

  const session = await Session.findById(decoaded.sessionId);
  if (!session || !session.valid)
    return next(new AppError(genericMessage, 400));

  const user = await User.findById(session.userId);
  if (!user) return next(new AppError(genericMessage, 400));

  const accessToken = await signJwt(user, "access");
  if (!accessToken)
    return next(
      new AppError("failed to create access token, please try again later", 500)
    );

  // res.cookie("accessToken", accessToken, cookieOptions);

  res.status(200).json({
    status: "success",
    data: {
      accessToken,
    },
  });
});
