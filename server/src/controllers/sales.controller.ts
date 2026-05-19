import { Request, Response } from "express";
import { salesService } from "../services/sales.service";
import { sendSuccess, sendError } from "../utils/response";

export const salesController = {
  getSales: async (req: Request, res: Response) => {
    try {
      const {
        startDate,
        endDate,
        cashierId,
        paymentMethod,
        type,
        page = "1",
        limit = "20",
      } = req.query;

      const sales = await salesService.getSales({
        startDate: startDate as string,
        endDate: endDate as string,
        cashierId: cashierId as string,
        paymentMethod: paymentMethod as string,
        type: type as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });
      sendSuccess(res, sales);
    } catch {
      sendError(res, "Failed to fetch sales", "FETCH_ERROR", 500);
    }
  },

  getSaleById: async (req: Request, res: Response) => {
    try {
      const sale = await salesService.getSaleById(req.params.id);
      if (!sale) return sendError(res, "Sale not found", "NOT_FOUND", 404);
      sendSuccess(res, sale);
    } catch {
      sendError(res, "Failed to fetch sale", "FETCH_ERROR", 500);
    }
  },

  getSummary: async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      const summary = await salesService.getSummary(
        startDate as string,
        endDate as string,
      );
      sendSuccess(res, summary);
    } catch {
      sendError(res, "Failed to fetch summary", "FETCH_ERROR", 500);
    }
  },

  getPreOrders: async (req: Request, res: Response) => {
    try {
      const { status, startDate, endDate } = req.query;
      const data = await salesService.getPreOrders({
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      sendSuccess(res, data);
    } catch {
      sendError(res, "Failed to fetch pre-orders", "FETCH_ERROR", 500);
    }
  },

  getUpcomingPreOrders: async (req: Request, res: Response) => {
    try {
      const data = await salesService.getUpcomingPreOrders();
      sendSuccess(res, data);
    } catch {
      sendError(res, "Failed to fetch upcoming pre-orders", "FETCH_ERROR", 500);
    }
  },

  updatePreOrderStatus: async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!status)
        return sendError(res, "Status is required", "VALIDATION_ERROR", 400);
      const data = await salesService.updatePreOrderStatus(
        req.params.id,
        status,
      );
      sendSuccess(res, data);
    } catch {
      sendError(res, "Failed to update status", "UPDATE_ERROR", 500);
    }
  },

  recordBalancePayment: async (req: Request, res: Response) => {
    try {
      const { amount, paymentMethod, note } = req.body;
      if (!amount)
        return sendError(res, "Amount is required", "VALIDATION_ERROR", 400);
      const data = await salesService.recordBalancePayment(
        req.params.id,
        amount,
        paymentMethod,
        note,
      );
      sendSuccess(res, data);
    } catch {
      sendError(res, "Failed to record payment", "UPDATE_ERROR", 500);
    }
  },
};
