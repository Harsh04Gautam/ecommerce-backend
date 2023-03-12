import express from "express";
import {
  loginUserHandler,
  refreshTokenHandler,
} from "../controllers/auth.controller";
import validateResource from "../middlewares/validateResource";
import { LoginUserSchema } from "../schemas/auth.schema";

const authRouter = express.Router();

authRouter.post("/login", validateResource(LoginUserSchema), loginUserHandler);
authRouter.get("/refreshtoken", refreshTokenHandler);

export default authRouter;
