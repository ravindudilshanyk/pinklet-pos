import { Router } from "express";
import { authController } from "../controllers/auth.controller";

const router = Router();

// GET /api/v1/auth/setup-status
router.get("/setup-status", authController.getSetupStatus);

// GET /api/v1/auth/accounts
router.get("/accounts", authController.getAccounts);

// POST /api/v1/auth/register
router.post("/register", authController.register);

// POST /api/v1/auth/login
router.post("/login", authController.login);

export default router;
