import express from "express";
import { globalErrorHandler } from "./controllers/error.controller";
import userRouter from "./routes/user.routes";
import dotenv from "dotenv";
import authRouter from "./routes/auth.routes";
import { deserializeUser } from "./middlewares/deserializeUser";
import AppError from "./utils/AppError";
import productRouter from "./routes/product.routes";
import reviewRouter from "./routes/review.routes";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.static("uploads"));
app.use(cookieParser());

app.use(deserializeUser);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.all("*", (req, _res, next) => {
  next(new AppError(`could not find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);
export default app;
