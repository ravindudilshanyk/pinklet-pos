import { Request, Response } from "express";
import { customerRepo } from "../repositories/customer.repo";
import { sendSuccess, sendError } from "../utils/response";

export const customersController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const customers = await customerRepo.findAll();
      const now = new Date();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const next3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const withSpent = customers.map((c) => ({
        ...c,
        totalSpent: c.bills.reduce((sum, b) => sum + b.total, 0),
        lastVisit: c.bills[0]?.createdAt || null,
      }))
        .map((c) => {
          const activePreOrderCount = c.bills.filter(
            (b) =>
              b.type === "pre_order" &&
              ["pending", "confirmed", "ready"].includes(b.status || ""),
          ).length;

          const dueSoonPreOrderCount = c.bills.filter((b) => {
            if (
              b.type !== "pre_order" ||
              !["pending", "confirmed", "ready"].includes(b.status || "") ||
              !b.deliveryDate
            ) {
              return false;
            }
            const due = new Date(b.deliveryDate);
            return due >= now && due <= next3Days;
          }).length;

          const recentVisitCount30d = c.bills.filter(
            (b) => new Date(b.createdAt) >= last30Days,
          ).length;

          const hasRecentVisit = c.lastVisit
            ? new Date(c.lastVisit) >= last30Days
            : false;

          const relevanceScore =
            (hasRecentVisit ? 120 : 0) +
            recentVisitCount30d * 25 +
            activePreOrderCount * 50 +
            dueSoonPreOrderCount * 80 +
            Math.min((c.totalSpent || 0) / 500, 60) +
            Math.min((c._count?.bills || 0) * 4, 40) +
            Math.min((c.points || 0) / 20, 30);

          return {
            ...c,
            activePreOrderCount,
            dueSoonPreOrderCount,
            recentVisitCount30d,
            relevanceScore,
          };
        });

      sendSuccess(res, withSpent);
    } catch {
      sendError(res, "Failed to fetch customers", "FETCH_ERROR", 500);
    }
  },

  search: async (req: Request, res: Response) => {
    try {
      const { q } = req.query;
      if (!q) return sendSuccess(res, []);
      const customers = await customerRepo.search(q as string);
      sendSuccess(res, customers);
    } catch {
      sendError(res, "Failed to search customers", "FETCH_ERROR", 500);
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const customer = await customerRepo.findById(req.params.id);
      if (!customer)
        return sendError(res, "Customer not found", "NOT_FOUND", 404);
      const totalSpent = await customerRepo.getTotalSpent(req.params.id);
      sendSuccess(res, { ...customer, totalSpent });
    } catch {
      sendError(res, "Failed to fetch customer", "FETCH_ERROR", 500);
    }
  },

  getBills: async (req: Request, res: Response) => {
    try {
      const bills = await customerRepo.findBills(req.params.id);
      sendSuccess(res, bills);
    } catch {
      sendError(res, "Failed to fetch customer bills", "FETCH_ERROR", 500);
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const { name, phone, whatsappNumber, email, birthday, notes } = req.body;
      if (!name)
        return sendError(res, "Name is required", "VALIDATION_ERROR", 400);
      const customer = await customerRepo.create({
        name,
        phone,
        whatsappNumber,
        email,
        birthday,
        notes,
      });
      sendSuccess(res, customer, 201);
    } catch (err: any) {
      if (err.code === "P2002") {
        return sendError(
          res,
          "Phone number already exists",
          "DUPLICATE_ERROR",
          409,
        );
      }
      sendError(res, "Failed to create customer", "CREATE_ERROR", 500);
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const customer = await customerRepo.update(req.params.id, req.body);
      sendSuccess(res, customer);
    } catch (err: any) {
      if (err.code === "P2002") {
        return sendError(
          res,
          "Phone number already exists",
          "DUPLICATE_ERROR",
          409,
        );
      }
      sendError(res, "Failed to update customer", "UPDATE_ERROR", 500);
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      await customerRepo.delete(req.params.id);
      sendSuccess(res, { deleted: true });
    } catch {
      sendError(res, "Failed to delete customer", "DELETE_ERROR", 500);
    }
  },
};
