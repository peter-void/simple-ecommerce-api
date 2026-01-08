import { z } from "zod";

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.uuid(),
      quantity: z.number().int().positive(),
    })
  ),
});

export type CreateOrderSchema = z.infer<typeof createOrderSchema>;
