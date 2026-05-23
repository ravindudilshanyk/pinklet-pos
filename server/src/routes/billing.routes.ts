import { Router } from "express";
import { billingController } from "../controllers/billing.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router: ReturnType<typeof Router> = Router();

router.use(authMiddleware);

router.get("/presets", billingController.getDiscountPresets);
router.post("/complete", billingController.completeBill);
router.post("/hold", billingController.holdBill);
router.get("/held", billingController.getHeldBills);
router.delete("/held/:id", billingController.deleteHeldBill);

export default router;
