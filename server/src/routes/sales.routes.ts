import { Router } from "express";
import { salesController } from "../controllers/sales.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router: ReturnType<typeof Router> = Router();
router.use(authMiddleware);

router.get("/", salesController.getSales);
router.get("/summary", salesController.getSummary);
router.get("/pre-orders", salesController.getPreOrders);
router.get("/pre-orders/upcoming", salesController.getUpcomingPreOrders);
router.patch("/pre-orders/:id/status", salesController.updatePreOrderStatus);
router.post("/pre-orders/:id/payment", salesController.recordBalancePayment);
router.get("/:id", salesController.getSaleById);

export default router;
