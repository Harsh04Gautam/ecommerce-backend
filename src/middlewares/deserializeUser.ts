import catchAsync from "../utils/catchAsync";
import { verifyJwt } from "../utils/jwt";

export const deserializeUser = catchAsync<{ id?: string }>(
  async (req, res, next) => {
    const token = req.headers.authorization?.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : null;
    if (!token) return next();

    const decoded = await verifyJwt<{ id?: string }>(token, "access");

    res.locals.user = decoded;
    next();
  }
);
