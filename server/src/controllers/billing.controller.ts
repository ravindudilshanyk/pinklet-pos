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

  initiatePayhere: async (req: Request, res: Response) => {
    try {
      const { billNumber, amount, customerName, customerEmail, customerPhone } =
        req.body;

      const orderId = payhereService.generateOrderId(billNumber);
      const hash = payhereService.generateHash(orderId, amount);

      sendSuccess(res, {
        merchantId: process.env.PAYHERE_MERCHANT_ID,
        orderId,
        amount: parseFloat(amount).toFixed(2),
        currency: "LKR",
        hash,
        checkoutUrl: payhereService.getCheckoutUrl(),
        customerName: customerName || "Customer",
        customerEmail: customerEmail || "customer@example.com",
        customerPhone: customerPhone || "0771234567",
        returnUrl: "http://localhost:5173/payment-success",
        cancelUrl: "http://localhost:5173/payment-cancel",
        notifyUrl: `http://localhost:${process.env.PORT || 3001}/api/v1/billing/payhere/callback`,
      });
    } catch {
      sendError(res, "Failed to initiate payment", "PAYHERE_ERROR", 500);
    }
  },

  payhereCallback: async (req: Request, res: Response) => {
    try {
      const {
        merchant_id,
        order_id,
        payment_id,
        payhere_amount,
        payhere_currency,
        status_code,
        md5sig,
      } = req.body;

      const valid = payhereService.verifyCallback(
        merchant_id,
        order_id,
        payment_id,
        payhere_amount,
        payhere_currency,
        status_code,
        md5sig,
      );

      if (!valid) {
        return res.status(400).send("Invalid signature");
      }

      // status_code 2 = successful
      if (status_code === "2") {
        console.log(`PayHere payment successful: ${order_id}`);
        // TODO: Update bill status to paid
      }

      res.send("OK");
    } catch {
      res.status(500).send("Error");
    }
  },
};
