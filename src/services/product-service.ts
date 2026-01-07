import db from "../db/index.js";
import type {
  CreateProductSchema,
  UpdateProductSchema,
} from "../schemas/product-schema.js";
import { throwHttpError } from "../utils/http-error.js";

export const getAllProductService = async ({
  limit,
  offset,
  search,
}: {
  limit: number;
  offset: number;
  search: string | undefined;
}) => {
  const where = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    where.push(`name ilike $${values.length}`);
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  const dataValues = [...values, limit, offset];

  const getProductQuery = `
    SELECT * FROM products
    ${whereClause}
    ORDER BY id DESC
    LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}
    `;

  const countQuery = `
  SELECT COUNT(*) FROM products 
  ${whereClause}
  `;

  const [productResult, countResult] = await Promise.all([
    db.query(getProductQuery, dataValues),
    db.query(countQuery, values),
  ]);

  return {
    data: productResult.rows,
    total: Number(countResult.rows[0].count),
  };
};

export const createProductService = async (data: CreateProductSchema) => {
  const { name, price, stock } = data;

  const query = await db.query(
    `
    INSERT INTO products (name, price, stock)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [name, price, stock]
  );

  return query.rows[0];
};

export const updateProductService = async (
  id: string,
  data: UpdateProductSchema
) => {
  const { name, price, stock } = data;

  const checkExistingProduct = await db.query(
    `
  SELECT * FROM products
  WHERE id = $1  
  `,
    [id]
  );

  if (checkExistingProduct.rowCount === 0) {
    throwHttpError(404, "Product not found", "PRODUCT_NOT_FOUND");
  }

  const query = await db.query(
    `
    UPDATE products SET name = $1, price = $2, stock = $3 WHERE id = $4 
    RETURNING *
    `,
    [name, price, stock, id]
  );

  return query.rows[0];
};

export const deleteProductService = async (id: string) => {
  const checkExistingProduct = await db.query(
    `
  SELECT * FROM products
  WHERE id = $1  
  `,
    [id]
  );

  if (checkExistingProduct.rowCount === 0) {
    throwHttpError(404, "Product not found", "PRODUCT_NOT_FOUND");
  }

  await db.query(
    `
    DELETE FROM products
    WHERE id = $1
    `,
    [id]
  );
};
