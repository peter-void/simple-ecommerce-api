import bcryptjs from "bcryptjs";
import db from "../db/index.js";
import { throwHttpError } from "../utils/http-error.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

export const registerService = async (data: any) => {
  const existingUserQuery = `
    SELECT * FROM 
    users WHERE email = $1
    `;

  const { name, email, password } = data;

  const existingUser = await db.query(existingUserQuery, [data.email]);

  if (existingUser.rowCount ?? 0 > 0) {
    throwHttpError(409, "Email already registered");
  }

  const hashPassword = await bcryptjs.hash(password, 10);

  const result = await db.query(
    `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [name, email, hashPassword]
  );

  return result.rows[0];
};

export const loginService = async (data: any) => {
  const { email, password } = data;

  const existingUser = await db.query(
    `
    SELECT * FROM users
    WHERE email = $1
    `,
    [email]
  );

  if (existingUser.rowCount === 0) {
    throwHttpError(401, "Invalid Credentials");
  }

  const user = existingUser.rows[0];

  const isValidPassword = await bcryptjs.compare(password, user.password_hash);

  if (!isValidPassword) {
    throwHttpError(401, "Invalid Credentials");
  }

  const accessToken = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "50m",
  });
  const refreshToken = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.query(
    `
    INSERT INTO refresh_token (user_id, token, expires_at)
    VALUES ($1, $2, $3)
    `,
    [user.id, refreshToken, new Date(expiresAt)]
  );

  return {
    accessToken,
    refreshToken,
  };
};

export async function refreshService(refreshToken: string) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const findTokenQuery = `
    SELECT * FROM refresh_token
    WHERE token = $1
    `;

    const refreshTokenResult = await client.query(findTokenQuery, [
      refreshToken,
    ]);

    if (refreshTokenResult.rowCount === 0) {
      throwHttpError(401, "Invalid refresh token");
    }

    const userId = refreshTokenResult.rows[0].user_id;

    await client.query(
      `
    DELETE FROM refresh_token
    WHERE token = $1  
    `,
      [refreshToken]
    );

    const newRefreshToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const accessToken = jwt.sign({ sub: userId }, process.env.JWT_SECRET!, {
      expiresIn: "10m",
    });

    await client.query(
      `
    INSERT INTO refresh_token (user_id, token, expires_at)
    VALUES ($1, $2, $3)
    `,
      [userId, newRefreshToken, new Date(expiresAt)]
    );

    await client.query("COMMIT");

    return {
      accessToken,
      newRefreshToken,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function logoutService(refreshToken: string) {
  await db.query(
    `
  DELETE FROM refresh_token
  WHERE token = $1  
  `,
    [refreshToken]
  );
}
