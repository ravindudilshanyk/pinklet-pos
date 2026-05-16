import { Request, Response } from "express";
import { settingsService } from "../services/settings.service";
import { sendSuccess, sendError } from "../utils/response";

export const settingsController = {
  getShopSettings: async (req: Request, res: Response) => {
    try {
      const settings = await settingsService.getShopSettings();
      sendSuccess(res, settings);
    } catch {
      sendError(res, "Failed to fetch settings", "FETCH_ERROR", 500);
    }
  },

  updateShopSettings: async (req: Request, res: Response) => {
    try {
      const settings = await settingsService.updateShopSettings(req.body);
      sendSuccess(res, settings);
    } catch {
      sendError(res, "Failed to update settings", "UPDATE_ERROR", 500);
    }
  },

  getCashiers: async (req: Request, res: Response) => {
    try {
      const cashiers = await settingsService.getCashiers();
      sendSuccess(res, cashiers);
    } catch {
      sendError(res, "Failed to fetch cashiers", "FETCH_ERROR", 500);
    }
  },

  createCashier: async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !password) {
        return sendError(
          res,
          "Name and password are required",
          "VALIDATION_ERROR",
          400,
        );
      }
      const cashier = await settingsService.createCashier({
        name,
        email,
        password,
      });
      sendSuccess(res, cashier, 201);
    } catch (err: any) {
      if (err.message === "EMAIL_EXISTS") {
        return sendError(res, "Email already exists", "DUPLICATE_ERROR", 409);
      }
      sendError(res, "Failed to create cashier", "CREATE_ERROR", 500);
    }
  },

  updateCashier: async (req: Request, res: Response) => {
    try {
      const cashier = await settingsService.updateCashier(
        req.params.id,
        req.body,
      );
      sendSuccess(res, cashier);
    } catch {
      sendError(res, "Failed to update cashier", "UPDATE_ERROR", 500);
    }
  },

  toggleCashier: async (req: Request, res: Response) => {
    try {
      const cashier = await settingsService.toggleCashier(req.params.id);
      sendSuccess(res, cashier);
    } catch {
      sendError(res, "Failed to toggle cashier", "UPDATE_ERROR", 500);
    }
  },

  deleteCashier: async (req: Request, res: Response) => {
    try {
      await settingsService.deleteCashier(req.params.id);
      sendSuccess(res, { deleted: true });
    } catch {
      sendError(res, "Failed to delete cashier", "DELETE_ERROR", 500);
    }
  },

  getDiscountPresets: async (req: Request, res: Response) => {
    try {
      const presets = await settingsService.getDiscountPresets();
      sendSuccess(res, presets);
    } catch {
      sendError(res, "Failed to fetch presets", "FETCH_ERROR", 500);
    }
  },

  createDiscountPreset: async (req: Request, res: Response) => {
    try {
      const preset = await settingsService.createDiscountPreset(req.body);
      sendSuccess(res, preset, 201);
    } catch {
      sendError(res, "Failed to create preset", "CREATE_ERROR", 500);
    }
  },

  updateDiscountPreset: async (req: Request, res: Response) => {
    try {
      const preset = await settingsService.updateDiscountPreset(
        req.params.id,
        req.body,
      );
      sendSuccess(res, preset);
    } catch {
      sendError(res, "Failed to update preset", "UPDATE_ERROR", 500);
    }
  },

  deleteDiscountPreset: async (req: Request, res: Response) => {
    try {
      await settingsService.deleteDiscountPreset(req.params.id);
      sendSuccess(res, { deleted: true });
    } catch {
      sendError(res, "Failed to delete preset", "DELETE_ERROR", 500);
    }
  },
};
