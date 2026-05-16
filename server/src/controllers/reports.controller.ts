import { Request, Response } from "express";
import { reportsService } from "../services/reports.service";
import { sendSuccess, sendError } from "../utils/response";

export const reportsController = {
  getOverview: async (req: Request, res: Response) => {
    try {
      const data = await reportsService.getOverview();
      sendSuccess(res, data);
    } catch {
      sendError(res, "Failed to fetch overview", "FETCH_ERROR", 500);
    }
  },

  getSalesChart: async (req: Request, res: Response) => {
    try {
      const { days = "7" } = req.query;
      const data = await reportsService.getSalesChart(parseInt(days as string));
      sendSuccess(res, data);
    } catch {
      sendError(res, "Failed to fetch chart data", "FETCH_ERROR", 500);
    }
  },

  getTopItems: async (req: Request, res: Response) => {
    try {
      const { limit = "10" } = req.query;
      const data = await reportsService.getTopItems(parseInt(limit as string));
      sendSuccess(res, data);
    } catch {
      sendError(res, "Failed to fetch top items", "FETCH_ERROR", 500);
    }
  },

  getSummary: async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, period } = req.query;
      const data = await reportsService.getSummary({
        startDate: startDate as string,
        endDate: endDate as string,
        period: period as string,
      });
      sendSuccess(res, data);
    } catch {
      sendError(res, "Failed to fetch summary", "FETCH_ERROR", 500);
    }
  },

  getCashierPerformance: async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      const data = await reportsService.getCashierPerformance(
        startDate as string,
        endDate as string,
      );
      sendSuccess(res, data);
    } catch {
      sendError(res, "Failed to fetch cashier performance", "FETCH_ERROR", 500);
    }
  },

  getPaymentBreakdown: async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      const data = await reportsService.getPaymentBreakdown(
        startDate as string,
        endDate as string,
      );
      sendSuccess(res, data);
    } catch {
      sendError(res, "Failed to fetch payment breakdown", "FETCH_ERROR", 500);
    }
  },

  getCategoryBreakdown: async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      const data = await reportsService.getCategoryBreakdown(
        startDate as string,
        endDate as string,
      );
      sendSuccess(res, data);
    } catch {
      sendError(res, "Failed to fetch category breakdown", "FETCH_ERROR", 500);
    }
  },
};
