import type { Request, Response, NextFunction } from "express";
import { throwHttpError } from "../utils/http-error";

export const requireRole =
  (role: "ADMIN" | "USER") =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throwHttpError(401, "Unauthorized", "UNAUTHORIZED");
    }

    if (req?.user?.role !== role) {
      throwHttpError(403, "Forbidden", "FORBIDDEN");
    }

    next();
  };
