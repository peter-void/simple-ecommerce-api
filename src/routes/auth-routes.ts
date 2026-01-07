import express from "express";
import {
  loginController,
  logoutController,
  refreshController,
  registerController,
} from "../controllers/auth-controller.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../schemas/auth-schema.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const router = express.Router();

router.post(
  "/register",
  validate({ body: registerSchema }),
  registerController
);

router.post("/login", validate({ body: loginSchema }), loginController);

router.get("/refresh", authMiddleware, refreshController);

router.post("/logout", authMiddleware, logoutController);

export default router;
