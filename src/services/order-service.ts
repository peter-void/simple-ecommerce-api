import db from "../db";
import type { CreateOrderSchema } from "../schemas/order-schema";
import { throwHttpError } from "../utils/http-error";
import { canTransition } from "../utils/order-status";

export const createOrderService = async (
  userId: string,
  orderData: CreateOrderSchema
) => {
  const client = await db.connect();
  const { items } = orderData;

  try {
    await client.query("BEGIN");

    let totalPrice = 0;
    let productPrice = 0;

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
        throwHttpError(404, "Product not found");
      }

      const product = productResult.rows[0];

      productPrice = product.price;

      if (product.stock < item.quantity) {
        throwHttpError(400, "Insufficient stock");
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
      INSERT INTO orders (user_id, total_price, status)
      VALUES ($1, $2, $3)
      RETURNING *  
    `,
      [userId, totalPrice, "PENDING"]
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        `
        INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
        VALUES ($1, $2, $3, $4)
        `,
        [order.id, item.productId, item.quantity, productPrice]
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

export const cancelOrderService = async ({
  orderId,
  userId,
}: {
  orderId: string;
  userId: string;
}) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const orderRes = await client.query(
      `
      SELECT * FROM orders
      WHERE id = $1 AND user_id $2
      FOR UPDATE
      `,
      [orderId, userId]
    );

    if (orderRes.rowCount === 0) {
      throwHttpError(404, "Order not found");
    }

    const order = orderRes.rows[0];

    if (!canTransition(order.status, "CANCELLED")) {
      throwHttpError(400, `Cannot cancel order with status ${order.status}`);
    }

    if (order.status !== "PENDING") {
      throwHttpError(400, "Order cannot be cancelled");
    }

    const itemsRes = await client.query(
      `
      SELECT * FROM order_items
      WHERE order_id = $1
      `,
      [order.id]
    );

    for (const item of itemsRes.rows) {
      await client.query(
        `
        SELECT id FROM products
        WHERE id = $1
        FOR UPDATE
        `,
        [item.product_id]
      );

      await client.query(
        `
        UPDATE products 
        SET stock = stock + $1
        WHERE id = $2
        `,
        [item.quantity, item.product_id]
      );
    }

    await client.query(
      `
        UPDATE orders
        SET status = 'CANCELLED'
        WHERE id = $1
        `,
      [orderId]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
