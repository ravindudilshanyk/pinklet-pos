import { Router } from "express";
import { itemsController } from "../controllers/items.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { wasteController } from '../controllers/waste.controller'

const router: ReturnType<typeof Router> = Router();
router.use(authMiddleware);

// Items
router.get("/", itemsController.getItems);
router.post("/", itemsController.createItem);
router.put("/:id", itemsController.updateItem);
router.delete("/:id", itemsController.deleteItem);
router.get("/barcode/:barcode", itemsController.getItemByBarcode);
router.get("/low-stock", itemsController.getLowStock);
router.post("/:id/adjust-stock", itemsController.adjustStock);
router.get('/waste-logs', wasteController.getAll)
router.post('/waste-logs', wasteController.create)
router.delete('/waste-logs/:id', wasteController.delete)

// Categories
router.get("/categories", itemsController.getCategories);
router.post("/categories", itemsController.createCategory);

// Suppliers
router.get("/suppliers", itemsController.getSuppliers);
router.post("/suppliers", itemsController.createSupplier);
router.put("/suppliers/:id", itemsController.updateSupplier);
router.delete("/suppliers/:id", itemsController.deleteSupplier);
router.post("/:id/waste", itemsController.logWaste);

export default router;
