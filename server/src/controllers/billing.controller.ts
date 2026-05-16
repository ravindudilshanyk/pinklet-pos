import { Request, Response } from "express";
import { billingService } from "../services/billing.service";
import { sendSuccess, sendError } from "../utils/response";
import { AuthRequest } from "../middleware/auth.middleware";

export const billingController = {
  getDiscountPresets: async (req: Request, res: Response) => {
    try {
      const presets = await billingService.getDiscountPresets();
      sendSuccess(res, presets);
    } catch {
      sendError(res, "Failed to fetch presets", "FETCH_ERROR", 500);
    }
  },

  completeBill: async (req: AuthRequest, res: Response) => {
    try {
      const cashierId = req.user!.userId;
      const result = await billingService.completeBill({
        ...req.body,
        cashierId,
      });
      sendSuccess(res, result, 201);
    } catch (err: any) {
      sendError(
        res,
        err.message || "Failed to complete bill",
        "BILL_ERROR",
        500,
      );
    }
  },

  holdBill: async (req: Request, res: Response) => {
    try {
      const held = await billingService.holdBill(req.body);
      sendSuccess(res, held, 201);
    } catch {
      sendError(res, "Failed to hold bill", "HOLD_ERROR", 500);
    }
  },

  getHeldBills: async (req: Request, res: Response) => {
    try {
      const held = await billingService.getHeldBills();
      sendSuccess(res, held);
    } catch {
      sendError(res, "Failed to fetch held bills", "FETCH_ERROR", 500);
    }
  },

  deleteHeldBill: async (req: Request, res: Response) => {
    try {
      await billingService.deleteHeldBill(req.params.id);
      sendSuccess(res, { deleted: true });
    } catch {
      sendError(res, "Failed to delete held bill", "DELETE_ERROR", 500);
    }
  },
};
