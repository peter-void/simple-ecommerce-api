import type { Request, Response } from "express";
import { throwHttpError } from "../utils/http-error";
import db from "../db";
import { supabase } from "../lib/supabase-client";

export const uploadProductImageController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const productId = req.params.id;

  if (!productId) {
    throwHttpError(400, "Product ID is required");
  }

  const fileBuffer = req.body;

  if (!Buffer.isBuffer(fileBuffer)) {
    throwHttpError(400, "Invalid file upload");
  }

  const productRes = await db.query(
    `
      SELECT id FROM products
      WHERE id = $1
      `,
    [productId]
  );

  if (productRes.rowCount === 0) {
    throwHttpError(404, "Product not found");
  }

  const fileName = `products/${productId}-${Date.now()}.png`;

  const { error } = await supabase.storage
    .from("products")
    .upload(fileName, fileBuffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) {
    throwHttpError(500, "Failed to upload image");
  }

  const { data: publicUrlData } = supabase.storage
    .from("products")
    .getPublicUrl(fileName);

  const imageUrl = publicUrlData.publicUrl;

  await db.query(
    `
      UPDATE products
      SET image_url = $1
      WHERE id = $2
      `,
    [imageUrl, productId]
  );

  res.status(200).json({
    message: "Product image uploaded successfully",
    imageUrl,
  });

  return res.json({ data: "MANTAP" });
};
