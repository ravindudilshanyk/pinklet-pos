import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export function ownerOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "owner") {
    return res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "Owner access required" },
    });
  }
  next();
}
