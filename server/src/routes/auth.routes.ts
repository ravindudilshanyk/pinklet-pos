import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router: ReturnType<typeof Router> = Router();

// Setup
router.get("/setup-status", authController.getSetupStatus);
router.post("/setup/send-otp", authController.sendOwnerSetupOTP);
router.post("/setup/verify-otp", authController.verifyOwnerSetupOTP);
router.post("/setup/complete", authController.completeOwnerSetup);

// Login
router.post("/login", authController.login);
router.post("/cashier-login", authController.cashierLogin);
router.get("/accounts", authController.getAccounts);

// Forgot password
router.post("/forgot-password/send-otp", authController.sendForgotPasswordOTP);
router.post(
  "/forgot-password/verify-otp",
  authController.verifyForgotPasswordOTP,
);
router.post("/forgot-password/reset", authController.resetPassword);

// Change password (authenticated)
router.post(
  "/change-password/send-otp",
  authMiddleware,
  authController.sendChangePasswordOTP,
);
router.post(
  "/change-password/verify",
  authMiddleware,
  authController.changePasswordWithOTP,
);

export default router;
