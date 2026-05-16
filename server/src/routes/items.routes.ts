import { Router } from "express";
import { itemsController } from "../controllers/items.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
router.use(authMiddleware);

// Items
router.get("/", itemsController.getItems);
router.post("/", itemsController.createItem);
router.put("/:id", itemsController.updateItem);
router.delete("/:id", itemsController.deleteItem);
router.get("/barcode/:barcode", itemsController.getItemByBarcode);
router.get("/low-stock", itemsController.getLowStock);
router.post("/:id/adjust-stock", itemsController.adjustStock);

// Categories
router.get("/categories", itemsController.getCategories);
router.post("/categories", itemsController.createCategory);

// Suppliers
router.get("/suppliers", itemsController.getSuppliers);
router.post("/suppliers", itemsController.createSupplier);
router.put("/suppliers/:id", itemsController.updateSupplier);
router.delete("/suppliers/:id", itemsController.deleteSupplier);

export default router;
