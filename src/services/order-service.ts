import db from "../db";
import type { CreateOrderSchema } from "../schemas/order-schema";
import { throwHttpError } from "../utils/http-error";

export const createOrderService = async (
  userId: string,
  orderData: CreateOrderSchema
) => {
  const client = await db.connect();
  const { items } = orderData;

  try {
    await client.query("BEGIN");

    let totalPrice = 0;

    for (const item of items) {
      const productResult = await client.query(
        `
      SELECT id,price,stock
      FROM products
      WHERE id = $1
      FOR UPDATE
      `,
        [item.productId]
      );

      if (productResult.rowCount === 0) {
        throw new Error("Product not found");
      }

      const product = productResult.rows[0];

      if (product.stock < item.quantity) {
        throw new Error("Insufficient stock");
      }

      totalPrice += product.price * item.quantity;

      await client.query(
        `
      UPDATE products
      SET stock = stock - $1
      WHERE id = $2  
      `,
        [item.quantity, product.id]
      );
    }

    const orderResult = await client.query(
      `
      INSERT INTO orders (user_id, total_price)
      VALUES ($1, $2)
      RETURNING *  
    `,
      [userId, totalPrice]
    );

    const orderId = orderResult.rows[0];

    for (const item of items) {
      const product = await client.query(
        `SELECT price FROM products WHERE id = $1`,
        [item.productId]
      );

      await client.query(
        `
        INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
        VALUES ($1, $2, $3, $4)
        `,
        [orderId, item.productId, item.quantity, product.rows[0].price]
      );
    }

    await client.query("COMMIT");

    return orderResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
