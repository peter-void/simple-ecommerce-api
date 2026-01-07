import type { Request, Response, NextFunction } from "express";

export const asyncHandler = (func: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    new Promise((resolve) => resolve(func(req, res, next))).catch((error) =>
      next(error)
    );
  };
};
