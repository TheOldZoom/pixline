import { NextFunction, Request, Response } from "express";
import { z } from "zod";

function ValidateSchema(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formattedErrors = result.error.errors.map((err) => ({
        message: err.message,
        path: err.path.length ? err.path : ["root"],
        code: err.code,
      }));

      return res.status(400).json({
        message: "Invalid data",
        errors: formattedErrors,
      });
    }
    next();
  };
}

export default ValidateSchema;
