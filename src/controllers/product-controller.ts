import type { Request, Response } from "express";
import {
  createProductService,
  deleteProductService,
  getAllProductService,
  updateProductService,
} from "../services/product-service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const getAllProductController = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Math.max(Number(req.query?.page ?? "1"), 1);
    const limit = Math.min(Math.max(Number(req.query?.limit ?? "10"), 1), 50);

    const search = ((req.query?.search as string) ?? "").trim() ?? "";

    const offset = (page - 1) * limit;

    const { data, total } = await getAllProductService({
      limit,
      offset,
      search,
    });

    res.status(200).json({
      data,
      meta: {
        total,
        page,
        limit,
      },
    });
  }
);

export const createProductController = asyncHandler(
  async (req: Request, res: Response) => {
    const createdProduct = await createProductService(req.body);

    res.status(201).json({ data: createdProduct });
  }
);

export const updateProductController = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const updatedProduct = await updateProductService(id, req.body);

    res.status(200).json({ data: updatedProduct });
  }
);

export const deleteProductController = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    await deleteProductService(id);

    res.status(200).json({ message: "Successfully deleted product" });
  }
);
