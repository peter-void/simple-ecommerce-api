import {
  cancelOrderService,
  createOrderService,
} from "../services/order-service";
import { asyncHandler } from "../utils/async-handler";
import type { Request, Response } from "express";

export const createOrderController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req?.user?.id as string;

    const order = await createOrderService(userId, req.body);

    res.status(201).json({
      data: order,
    });
  }
);

export const cancelOrderController = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const userId = req?.user?.id as string;
    const orderId = req.params.id;

    await cancelOrderService({ userId, orderId });

    res.json({ message: "Order cancelled successfully" });
  }
);
