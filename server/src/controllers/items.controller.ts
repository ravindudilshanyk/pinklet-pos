import { Request, Response } from "express";
import { inventoryService } from "../services/inventory.service";
import { sendSuccess, sendError } from "../utils/response";
import { db } from '../utils/db'

export const itemsController = {
  getItems: async (req: Request, res: Response) => {
    try {
      const { categoryId, supplierId, search, filter } = req.query;
      const items = await inventoryService.getItems({
        categoryId: categoryId as string,
        supplierId: supplierId as string,
        search: search as string,
        filter: filter as string,
      });
      sendSuccess(res, items);
    } catch {
      sendError(res, "Failed to fetch items", "FETCH_ERROR", 500);
    }
  },

  getCategories: async (req: Request, res: Response) => {
    try {
      const categories = await inventoryService.getCategories();
      sendSuccess(res, categories);
    } catch {
      sendError(res, "Failed to fetch categories", "FETCH_ERROR", 500);
    }
  },

  createCategory: async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      if (!name)
        return sendError(res, "Name is required", "VALIDATION_ERROR", 400);
      const category = await inventoryService.createCategory(name);
      sendSuccess(res, category, 201);
    } catch {
      sendError(res, "Failed to create category", "CREATE_ERROR", 500);
    }
  },

  getSuppliers: async (req: Request, res: Response) => {
    try {
      const suppliers = await inventoryService.getSuppliers();
      sendSuccess(res, suppliers);
    } catch {
      sendError(res, "Failed to fetch suppliers", "FETCH_ERROR", 500);
    }
  },

  createSupplier: async (req: Request, res: Response) => {
    try {
      const supplier = await inventoryService.createSupplier(req.body);
      sendSuccess(res, supplier, 201);
    } catch {
      sendError(res, "Failed to create supplier", "CREATE_ERROR", 500);
    }
  },

  updateSupplier: async (req: Request, res: Response) => {
    try {
      const supplier = await inventoryService.updateSupplier(
        req.params.id,
        req.body,
      );
      sendSuccess(res, supplier);
    } catch {
      sendError(res, "Failed to update supplier", "UPDATE_ERROR", 500);
    }
  },

  deleteSupplier: async (req: Request, res: Response) => {
    try {
      await inventoryService.deleteSupplier(req.params.id);
      sendSuccess(res, { deleted: true });
    } catch {
      sendError(res, "Failed to delete supplier", "DELETE_ERROR", 500);
    }
  },

  getItemByBarcode: async (req: Request, res: Response) => {
    try {
      const item = await inventoryService.getItemByBarcode(req.params.barcode);
      if (!item) return sendError(res, "Item not found", "NOT_FOUND", 404);
      sendSuccess(res, item);
    } catch {
      sendError(res, "Failed to fetch item", "FETCH_ERROR", 500);
    }
  },

  createItem: async (req: Request, res: Response) => {
    try {
      const item = await inventoryService.createItem(req.body);
      sendSuccess(res, item, 201);
    } catch {
      sendError(res, "Failed to create item", "CREATE_ERROR", 500);
    }
  },

  updateItem: async (req: Request, res: Response) => {
    try {
      const item = await inventoryService.updateItem(req.params.id, req.body);
      sendSuccess(res, item);
    } catch {
      sendError(res, "Failed to update item", "UPDATE_ERROR", 500);
    }
  },

  deleteItem: async (req: Request, res: Response) => {
    try {
      await inventoryService.deleteItem(req.params.id);
      sendSuccess(res, { deleted: true });
    } catch {
      sendError(res, "Failed to delete item", "DELETE_ERROR", 500);
    }
  },

  getLowStock: async (req: Request, res: Response) => {
    try {
      const items = await inventoryService.getLowStockItems();
      sendSuccess(res, items);
    } catch {
      sendError(res, "Failed to fetch low stock", "FETCH_ERROR", 500);
    }
  },

  adjustStock: async (req: Request, res: Response) => {
    try {
      const { quantity, note } = req.body;
      const item = await inventoryService.adjustStock(
        req.params.id,
        quantity,
        note,
      );
      sendSuccess(res, item);
    } catch {
      sendError(res, "Failed to adjust stock", "ADJUST_ERROR", 500);
    }
  },

  logWaste: async (req: Request, res: Response) => {
    try {
      const { quantity, reason, note } = req.body;
      const item = await db.item.findUnique({ where: { id: req.params.id } });
      if (!item) return sendError(res, "Item not found", "NOT_FOUND", 404);

      await db.wasteLog.create({
        data: {
          itemId: req.params.id,
          quantity,
          reason,
          note: note || null,
          cost: quantity * item.buyingPrice,
        },
      });

      await db.item.update({
        where: { id: req.params.id },
        data: { stock: { decrement: quantity } },
      });

      await db.stockMovement.create({
        data: {
          itemId: req.params.id,
          type: "waste",
          quantity: -quantity,
          note: reason,
        },
      });

      sendSuccess(res, { logged: true });
    } catch {
      sendError(res, "Failed to log waste", "WASTE_ERROR", 500);
    }
  },
};
