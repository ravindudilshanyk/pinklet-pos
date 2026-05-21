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
      if (!itemId || reason == null) {
        return sendError(
          res,
          "itemId, quantity and reason are required",
          "VALIDATION_ERROR",
          400,
        );
      }
      // Validate quantity
      const qty = Number(quantity);
      if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty <= 0) {
        return sendError(res, "Quantity must be a positive integer", "VALIDATION_ERROR", 400);
      }

      // Get item to calculate cost and validate stock
      const item = await db.item.findUnique({ where: { id: itemId } });
      if (!item) return sendError(res, "Item not found", "NOT_FOUND", 404);
      if (typeof item.stock === "number" && qty > item.stock) {
        return sendError(res, "Quantity exceeds available stock", "VALIDATION_ERROR", 400);
      }

      const cost = item.buyingPrice * qty;

      // Create waste log, update stock and record movement inside a transaction
      const log = await db.$transaction(async (tx) => {
        const created = await tx.wasteLog.create({
          data: { itemId, quantity: qty, reason, note, cost },
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

        await tx.item.update({ where: { id: itemId }, data: { stock: { decrement: qty } } });

        // Test hook: force a failure after stock mutation to verify rollback.
        if (process.env.WASTE_TEST_FAIL_AFTER_STOCK === "1") {
          throw new Error("TEST_FAIL_AFTER_WASTE_STOCK");
        }

        await tx.stockMovement.create({
          data: {
            itemId,
            type: "waste",
            quantity: -qty,
            note: `Waste: ${reason}${note ? " — " + note : ""}`,
          },
        });

        return created;
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
