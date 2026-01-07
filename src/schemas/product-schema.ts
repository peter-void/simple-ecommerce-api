import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(3, { error: "Name is required" }),
  price: z.number().int().min(1, { error: "Min 1" }),
  stock: z.number().int().min(1, { error: "Min 1" }),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, { error: "Name is required" }),
  price: z.number().int().min(1, { error: "Min 1" }),
  stock: z.number().int().min(1, { error: "Min 1" }),
});

export const idSchema = z.string().min(1, { error: "Id is required" });

export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
