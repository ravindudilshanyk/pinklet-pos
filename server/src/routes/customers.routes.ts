import { Router } from "express";
import { customersController } from "../controllers/customers.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
router.use(authMiddleware);

router.get("/", customersController.getAll);
router.get("/search", customersController.search);
router.get("/:id", customersController.getById);
router.get("/:id/bills", customersController.getBills);
router.post("/", customersController.create);
router.put("/:id", customersController.update);
router.delete("/:id", customersController.delete);

export default router;
