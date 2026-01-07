import type { Request, Response, NextFunction } from "express";
import { throwHttpError } from "../utils/http-error";
import jwt from "jsonwebtoken";
import db from "../db";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throwHttpError(401, "Unauthorized");
  }

  const token = authHeader?.split(" ")[1];
  if (!token) {
    throwHttpError(401, "Unauthorized");
  }

  const payload = jwt.verify(token!, process.env.JWT_SECRET!) as {
    sub: string;
  };
  const userId = payload.sub;

  const result = await db.query(
    `
  SELECT * FROM users
  WHERE id = $1  
  `,
    [userId]
  );

  if (result.rowCount === 0) {
    throwHttpError(401, "User not found");
  }

  req.user = {
    id: result.rows[0].id,
    role: result.rows[0].role,
  };

  next();
}
