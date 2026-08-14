import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { userId: string; role: string };
    }
  }
}

export const auth = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // ⚠️ Assignment spec অনুযায়ী token সরাসরি header এ, "Bearer " prefix ছাড়া
    const token = req.headers.authorization;

    if (!token) {
      throw new AppError(401, "You are not authorized");
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET as string
      ) as JwtPayload & { userId: string; role: string };

      if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
        throw new AppError(403, "You do not have permission for this action");
      }

      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(401, "Invalid or expired token");
    }
  };
};