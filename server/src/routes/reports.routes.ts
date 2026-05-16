import { Router } from "express";
import { reportsController } from "../controllers/reports.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
router.use(authMiddleware);

router.get("/overview", reportsController.getOverview);
router.get("/sales-chart", reportsController.getSalesChart);
router.get("/top-items", reportsController.getTopItems);
router.get("/summary", reportsController.getSummary);
router.get("/cashier-performance", reportsController.getCashierPerformance);
router.get("/payment-breakdown", reportsController.getPaymentBreakdown);
router.get("/category-breakdown", reportsController.getCategoryBreakdown);

export default router;
