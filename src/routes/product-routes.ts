import express from "express";
import {
  createProductController,
  deleteProductController,
  getAllProductController,
  updateProductController,
} from "../controllers/product-controller.js";
import { requireRole } from "../middlewares/require-role.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { validate } from "../middlewares/validate.js";
import { createProductSchema } from "../schemas/product-schema.js";
import { uploadProductImageController } from "../controllers/upload-product-image-controller.js";

const router = express.Router();

router.get("/", getAllProductController);

router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  validate({ body: createProductSchema }),
  createProductController
);

router.put(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  updateProductController
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  deleteProductController
);

router.post("/:id/upload", authMiddleware, uploadProductImageController);

export default router;
