import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { sendSuccess, sendError } from "../utils/response";

export const authController = {
  getSetupStatus: async (req: Request, res: Response) => {
    try {
      const data = await authService.getSetupStatus();
      sendSuccess(res, data);
    } catch (err) {
      sendError(res, "Failed to get status", "STATUS_ERROR", 500);
    }
  },

  getAccounts: async (req: Request, res: Response) => {
    try {
      const accounts = await authService.getAccounts();
      sendSuccess(res, accounts);
    } catch (err) {
      sendError(res, "Failed to get accounts", "FETCH_ERROR", 500);
    }
  },

  register: async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return sendError(
          res,
          "All fields are required",
          "VALIDATION_ERROR",
          400,
        );
      }

      const result = await authService.register({ name, email, password });
      sendSuccess(res, result, 201);
    } catch (err: any) {
      if (err.message === "OWNER_EXISTS") {
        return sendError(
          res,
          "Owner account already exists",
          "OWNER_EXISTS",
          409,
        );
      }
      sendError(res, "Registration failed", "REGISTER_ERROR", 500);
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { userId, password } = req.body;

      if (!userId || !password) {
        return sendError(
          res,
          "userId and password are required",
          "VALIDATION_ERROR",
          400,
        );
      }

      const result = await authService.login({ userId, password });
      sendSuccess(res, result);
    } catch (err: any) {
      if (err.message === "USER_NOT_FOUND") {
        return sendError(res, "Account not found", "USER_NOT_FOUND", 404);
      }
      if (err.message === "INVALID_PASSWORD") {
        return sendError(res, "Incorrect password", "INVALID_PASSWORD", 401);
      }
      if (err.message === "ACCOUNT_DISABLED") {
        return sendError(res, "Account is disabled", "ACCOUNT_DISABLED", 403);
      }
      sendError(res, "Login failed", "LOGIN_ERROR", 500);
    }
  },
};
