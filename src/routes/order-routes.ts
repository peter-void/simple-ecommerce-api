import express from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { validate } from "../middlewares/validate";
import { createOrderSchema } from "../schemas/order-schema";
import { createOrderController } from "../controllers/order-controller";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validate({ body: createOrderSchema }),
  createOrderController
);

export default router;
