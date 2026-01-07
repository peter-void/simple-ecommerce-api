import { ZodError } from "zod";
import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/http-error";

const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      code: "VALIDATION_ERROR",
      details: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code ?? null,
    });
  }

  // UNEXPECTED ERROR
  console.error("Unexpected Error: ", err);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
  });
};

export default errorMiddleware;
