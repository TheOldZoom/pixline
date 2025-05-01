import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

function ValidateSchema<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const formattedErrors = formatZodErrors(result.error);
        return res.status(400).json({
          message: "Invalid request data",
          errors: formattedErrors,
        });
      }

      req.body = result.data;

      return next();
    } catch (error) {
      console.error("Schema validation error:", error);
      return res.status(500).json({
        message: "Server error during validation",
      });
    }
  };
}

function formatZodErrors(error: ZodError): Array<{
  message: string;
  path: (string | number)[];
  code: string;
}> {
  return error.errors.map((err) => ({
    message: err.message,
    path: err.path.length ? err.path : ["root"],
    code: err.code,
  }));
}

export default ValidateSchema;
