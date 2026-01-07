import { meService } from "../services/me-service";
import { asyncHandler } from "../utils/async-handler";
import type { Request, Response } from "express";

export const meController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await meService(req.user!);

    res.status(200).json({ data: user });
  }
);
