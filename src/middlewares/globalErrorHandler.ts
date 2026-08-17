import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { Prisma } from "../generated/prisma/client.js";

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Something went wrong";
  let errorDetails: unknown = err;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    
    if (err.code === "P2002") {
      statusCode = 409;
      message = `Duplicate value for field: ${err.meta?.target}`;
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "Record not found";
    } else {
      statusCode = 400;
      message = "Database request error";
    }
  } else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
  });
};