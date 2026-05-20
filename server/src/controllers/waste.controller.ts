import { Request, Response } from "express";
import { db } from "../utils/db";
import { sendSuccess, sendError } from "../utils/response";

export const wasteController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const logs = await db.wasteLog.findMany({
        include: {
          item: {
            select: {
              id: true,
              name: true,
              sellingPrice: true,
              buyingPrice: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      sendSuccess(res, logs);
    } catch {
      sendError(res, "Failed to fetch waste logs", "FETCH_ERROR", 500);
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const { itemId, quantity, reason, note } = req.body;
      if (!itemId || !quantity || !reason) {
        return sendError(
          res,
          "itemId, quantity and reason are required",
          "VALIDATION_ERROR",
          400,
        );
      }

      // Get item to calculate cost
      const item = await db.item.findUnique({ where: { id: itemId } });
      if (!item) return sendError(res, "Item not found", "NOT_FOUND", 404);

      const cost = item.buyingPrice * quantity;

      // Create waste log
      const log = await db.wasteLog.create({
        data: { itemId, quantity, reason, note, cost },
        include: {
          item: {
            select: {
              id: true,
              name: true,
              sellingPrice: true,
              buyingPrice: true,
            },
          },
        },
      });

      // Deduct from stock
      await db.item.update({
        where: { id: itemId },
        data: { stock: { decrement: quantity } },
      });

      // Record stock movement
      await db.stockMovement.create({
        data: {
          itemId,
          type: "waste",
          quantity: -quantity,
          note: `Waste: ${reason}${note ? " — " + note : ""}`,
        },
      });

      sendSuccess(res, log, 201);
    } catch {
      sendError(res, "Failed to create waste log", "CREATE_ERROR", 500);
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      await db.wasteLog.delete({ where: { id: req.params.id } });
      sendSuccess(res, { deleted: true });
    } catch {
      sendError(res, "Failed to delete waste log", "DELETE_ERROR", 500);
    }
  },
};
