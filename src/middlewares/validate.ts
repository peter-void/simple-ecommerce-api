import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

type ValidateSchemas<TBody, TParams, TQuery> = {
  body?: ZodSchema<TBody>;
  params?: ZodSchema<TParams>;
  query?: ZodSchema<TQuery>;
};

export const validate =
  <Tbody = unknown, TParams = unknown, TQuery = unknown>({
    body,
    params,
    query,
  }: ValidateSchemas<Tbody, TParams, TQuery>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (body) req.body = body.parse(req.body);
      if (params) req.params = params.parse(req.params) as any;
      if (query) req.query = query.parse(req.query) as any;
      next();
    } catch (error) {
      next(error);
    }
  };
