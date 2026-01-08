import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import { meController } from "./controllers/me-controller.js";
import db from "./db/index.js";
import { authMiddleware } from "./middlewares/auth-middleware.js";
import errorMiddleware from "./middlewares/error.js";
import authRoutes from "./routes/auth-routes.js";
import productRoutes from "./routes/product-routes.js";
import orderRoutes from "./routes/order-routes.js";

const app = express();

app.use(cookieParser());
app.use(express.json());

app.get("/health", async (req, res) => {
  const result = await db.query("SELECT 1");
  res.json({ db: "Connected", result: result.rows });
});

app.get("/me", authMiddleware, meController);

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

app.use(errorMiddleware);

export default app;
