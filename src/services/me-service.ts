import db from "../db";
import type { User } from "../types/users";
import { throwHttpError } from "../utils/http-error";

export const meService = async (data: User) => {
  const { id } = data;

  const findUserQuery = `
  SELECT * FROM users
  WHERE id = $1
  `;

  const user = await db.query(findUserQuery, [id]);

  if (user.rowCount === 0) {
    throwHttpError(404, "User not found");
  }

  return user.rows[0];
};
