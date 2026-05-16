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
};
