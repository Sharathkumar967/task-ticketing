import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/express";

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message:
          "Access denied: You do not have permission to perform this action",
      });
    }
    next();
  };
};
