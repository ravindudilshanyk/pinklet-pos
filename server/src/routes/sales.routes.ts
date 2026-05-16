import { Router } from "express";
import { salesController } from "../controllers/sales.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
router.use(authMiddleware);

router.get("/", salesController.getSales);
router.get("/summary", salesController.getSummary);
router.get("/:id", salesController.getSaleById);

export default router;
