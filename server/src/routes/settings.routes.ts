import { Router } from "express";
import { settingsController } from "../controllers/settings.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { ownerOnly } from "../middleware/role.middleware";
import { backupController } from "../controllers/backup.controller";

const router: ReturnType<typeof Router> = Router();
router.use(authMiddleware);

// Shop settings
router.get("/shop", settingsController.getShopSettings);
router.put("/shop", ownerOnly, settingsController.updateShopSettings);

// Cashier accounts
router.get("/cashiers", settingsController.getCashiers);
router.post("/cashiers", ownerOnly, settingsController.createCashier);
router.put("/cashiers/:id", ownerOnly, settingsController.updateCashier);
router.patch(
  "/cashiers/:id/toggle",
  ownerOnly,
  settingsController.toggleCashier,
);
router.delete("/cashiers/:id", ownerOnly, settingsController.deleteCashier);

// Discount presets
router.get("/discounts", settingsController.getDiscountPresets);
router.post("/discounts", ownerOnly, settingsController.createDiscountPreset);
router.put(
  "/discounts/:id",
  ownerOnly,
  settingsController.updateDiscountPreset,
);
router.delete(
  "/discounts/:id",
  ownerOnly,
  settingsController.deleteDiscountPreset,
);

router.get("/backup/download", ownerOnly, backupController.downloadBackup);
router.post("/backup/restore", ownerOnly, backupController.restoreBackup);
router.get("/backup/list", ownerOnly, backupController.listBackups);
router.post("/backup/auto", ownerOnly, backupController.createAutoBackup);

export default router;
