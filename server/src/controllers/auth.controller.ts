import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { sendSuccess, sendError } from "../utils/response";

export const authController = {
  getSetupStatus: async (req: Request, res: Response) => {
    try {
      const status = await authService.getSetupStatus();
      sendSuccess(res, status);
    } catch {
      sendError(res, "Failed to get setup status", "ERROR", 500);
    }
  },

  sendOwnerSetupOTP: async (req: Request, res: Response) => {
    try {
      const { email, shopName } = req.body;
      if (!email || !shopName) {
        return sendError(
          res,
          "Email and shop name required",
          "VALIDATION_ERROR",
          400,
        );
      }
      const result = await authService.sendOwnerSetupOTP(email, shopName);
      sendSuccess(res, {
        message: "OTP sent to your email",
        ...result,
      });
    } catch (err: any) {
      if (err.message === "OWNER_EXISTS") {
        return sendError(
          res,
          "Owner account already exists",
          "OWNER_EXISTS",
          409,
        );
      }
      if (err.message === "EMAIL_EXISTS") {
        return sendError(res, "Email already in use", "EMAIL_EXISTS", 409);
      }
      console.error("Send setup OTP error:", err);
      sendError(
        res,
        "Failed to send OTP. Check email configuration.",
        "EMAIL_ERROR",
        500,
      );
    }
  },

  verifyOwnerSetupOTP: async (req: Request, res: Response) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp)
        return sendError(
          res,
          "Email and OTP required",
          "VALIDATION_ERROR",
          400,
        );
      const result = await authService.verifyOwnerSetupOTP(email, otp);
      sendSuccess(res, result);
    } catch (err: any) {
      if (err.message === "OTP_EXPIRED")
        return sendError(
          res,
          "OTP has expired. Please request a new one.",
          "OTP_EXPIRED",
          400,
        );
      if (err.message === "INVALID_OTP")
        return sendError(
          res,
          "Incorrect OTP. Please check your email.",
          "INVALID_OTP",
          400,
        );
      sendError(res, "Failed to verify OTP", "VERIFY_ERROR", 500);
    }
  },

  completeOwnerSetup: async (req: Request, res: Response) => {
    try {
      const { email, name, shopName, password } = req.body;
      if (!email || !name || !shopName || !password) {
        return sendError(res, "All fields required", "VALIDATION_ERROR", 400);
      }
      if (password.length < 6) {
        return sendError(
          res,
          "Password must be at least 6 characters",
          "VALIDATION_ERROR",
          400,
        );
      }
      const result = await authService.completeOwnerSetup({
        email,
        name,
        shopName,
        password,
      });
      sendSuccess(res, result, 201);
    } catch (err: any) {
      if (err.message === "EMAIL_NOT_VERIFIED") {
        return sendError(
          res,
          "Email not verified. Please complete OTP verification first.",
          "NOT_VERIFIED",
          400,
        );
      }
      if (err.message === "OWNER_EXISTS") {
        return sendError(
          res,
          "Owner account already exists",
          "OWNER_EXISTS",
          409,
        );
      }
      sendError(res, "Failed to create account", "CREATE_ERROR", 500);
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return sendError(
          res,
          "Email and password required",
          "VALIDATION_ERROR",
          400,
        );
      const result = await authService.login(email, password);
      sendSuccess(res, result);
    } catch (err: any) {
      if (err.message === "INVALID_CREDENTIALS")
        return sendError(
          res,
          "Invalid email or password",
          "INVALID_CREDENTIALS",
          401,
        );
      if (err.message === "ACCOUNT_DISABLED")
        return sendError(res, "Account is disabled", "ACCOUNT_DISABLED", 403);
      sendError(res, "Login failed", "LOGIN_ERROR", 500);
    }
  },

  cashierLogin: async (req: Request, res: Response) => {
    try {
      const { userId, password } = req.body;
      if (!userId || !password)
        return sendError(
          res,
          "User ID and password required",
          "VALIDATION_ERROR",
          400,
        );
      const result = await authService.cashierLogin(userId, password);
      sendSuccess(res, result);
    } catch (err: any) {
      if (err.message === "INVALID_CREDENTIALS")
        return sendError(
          res,
          "Invalid credentials",
          "INVALID_CREDENTIALS",
          401,
        );
      if (err.message === "ACCOUNT_DISABLED")
        return sendError(res, "Account is disabled", "ACCOUNT_DISABLED", 403);
      sendError(res, "Login failed", "LOGIN_ERROR", 500);
    }
  },

  getAccounts: async (req: Request, res: Response) => {
    try {
      const accounts = await authService.getAccounts();
      sendSuccess(res, accounts);
    } catch {
      sendError(res, "Failed to get accounts", "ERROR", 500);
    }
  },

  sendForgotPasswordOTP: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email)
        return sendError(res, "Email required", "VALIDATION_ERROR", 400);
      const result = await authService.sendForgotPasswordOTP(email);
      sendSuccess(res, { message: "OTP sent", ...result });
    } catch (err: any) {
      if (err.message === "NOT_FOUND")
        return sendError(res, "No account with this email", "NOT_FOUND", 404);
      console.error("Forgot password OTP error:", err);
      sendError(res, "Failed to send OTP", "EMAIL_ERROR", 500);
    }
  },

  verifyForgotPasswordOTP: async (req: Request, res: Response) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp)
        return sendError(
          res,
          "Email and OTP required",
          "VALIDATION_ERROR",
          400,
        );
      const result = await authService.verifyForgotOTP(email, otp);
      sendSuccess(res, result);
    } catch (err: any) {
      if (err.message === "OTP_EXPIRED")
        return sendError(res, "OTP expired", "OTP_EXPIRED", 400);
      if (err.message === "INVALID_OTP")
        return sendError(res, "Invalid OTP", "INVALID_OTP", 400);
      sendError(res, "Verification failed", "VERIFY_ERROR", 500);
    }
  },

  resetPassword: async (req: Request, res: Response) => {
    try {
      const { email, resetToken, newPassword } = req.body;
      if (!email || !resetToken || !newPassword) {
        return sendError(res, "All fields required", "VALIDATION_ERROR", 400);
      }
      await authService.resetPassword(email, resetToken, newPassword);
      sendSuccess(res, { message: "Password reset successfully" });
    } catch (err: any) {
      if (err.message === "INVALID_TOKEN")
        return sendError(res, "Invalid reset token", "INVALID_TOKEN", 400);
      if (err.message === "TOKEN_EXPIRED")
        return sendError(res, "Reset token expired", "TOKEN_EXPIRED", 400);
      sendError(res, "Reset failed", "RESET_ERROR", 500);
    }
  },

  sendChangePasswordOTP: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      const result = await authService.sendChangePasswordOTP(userId);
      sendSuccess(res, result);
    } catch (err: any) {
      if (err.message === "NO_EMAIL")
        return sendError(res, "No email linked to account", "NO_EMAIL", 400);
      console.error("Change password OTP error:", err);
      sendError(res, "Failed to send OTP", "EMAIL_ERROR", 500);
    }
  },

  changePasswordWithOTP: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      const { otp, newPassword, confirmPassword } = req.body;
      if (!otp || !newPassword)
        return sendError(
          res,
          "OTP and password required",
          "VALIDATION_ERROR",
          400,
        );
      if (newPassword !== confirmPassword)
        return sendError(
          res,
          "Passwords do not match",
          "VALIDATION_ERROR",
          400,
        );
      if (newPassword.length < 6)
        return sendError(res, "Password too short", "VALIDATION_ERROR", 400);
      await authService.changePassword(userId, otp, newPassword);
      sendSuccess(res, { message: "Password changed" });
    } catch (err: any) {
      if (err.message === "INVALID_OTP")
        return sendError(res, "Invalid OTP", "INVALID_OTP", 400);
      if (err.message === "OTP_EXPIRED")
        return sendError(res, "OTP expired", "OTP_EXPIRED", 400);
      sendError(res, "Failed to change password", "CHANGE_ERROR", 500);
    }
  },
};
