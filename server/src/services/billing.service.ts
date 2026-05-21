import { billRepo } from "../repositories/bill.repo";
import { itemRepo } from "../repositories/item.repo";
import { customerRepo } from "../repositories/customer.repo";
import { db } from "../utils/db";

const COINS_PER_AMOUNT = 1000;
const COIN_EXPIRY_DAYS = 365;

export const billingService = {
  getDiscountPresets: () => {
    return billRepo.getDiscountPresets();
  },

  completeBill: async (data: {
    cashierId: string;
    customerId?: string;
    type: string;
    status?: string;
    paymentMethod: string;
    items: {
      itemId: string;
      quantity: number;
      unitPrice: number;
      buyingPrice: number;
      discountAmount: number;
      discountType?: string;
      discountValue?: number;
      lineTotal: number;
    }[];
    subtotal: number;
    discountAmount: number;
    tax: number;
    loyaltyCoinsUsed: number;
    total: number;
    amountReceived: number;
    change: number;
    note?: string;
    orderDate?: string | Date;
    deliveryDate?: string | Date;
    advancePayment?: number;
  }) => {
    const parseDate = (value?: string | Date) => {
      if (!value) return undefined;
      if (value instanceof Date) return value;

      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? undefined : parsed;
    };

    // Build lines with profit
    const lines = data.items.map((item) => ({
      itemId: item.itemId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      buyingPrice: item.buyingPrice,
      discountAmount: item.discountAmount,
      discountType: item.discountType,
      discountValue: item.discountValue,
      lineTotal: item.lineTotal,
      profit:
        (item.unitPrice - item.buyingPrice) * item.quantity -
        item.discountAmount,
    }));

    const coinsEarned = Math.floor(data.total / COINS_PER_AMOUNT);

    // Run the whole sequence inside a transaction to ensure atomicity.
    const result = await db.$transaction(async (tx) => {
      // Generate bill number using the transactional client
      const bills = await tx.bill.findMany({ select: { billNumber: true } });
      const nextNumber = bills.reduce((highest, b) => {
        const match = b.billNumber.match(/^POS-(\d+)$/);
        if (!match) return highest;
        const current = Number.parseInt(match[1], 10);
        return Number.isNaN(current) ? highest : Math.max(highest, current);
      }, 0);
      const billNumber = `POS-${String(nextNumber + 1).padStart(4, "0")}`;

      const billData = {
        cashierId: data.cashierId,
        customerId: data.customerId,
        type: data.type,
        paymentMethod: data.paymentMethod,
        subtotal: data.subtotal,
        discountAmount: data.discountAmount,
        tax: data.tax,
        loyaltyCoinsUsed: data.loyaltyCoinsUsed,
        loyaltyCoinsEarned: coinsEarned,
        total: data.total,
        amountReceived: data.amountReceived,
        change: data.change,
        note: data.note,
        status: data.status,
        orderDate: parseDate(data.orderDate),
        deliveryDate: parseDate(data.deliveryDate),
        advancePayment: data.advancePayment,
      };

      const bill = await tx.bill.create({
        data: {
          billNumber,
          ...billData,
          customerId: billData.customerId || null,
          status: billData.status || undefined,
          note: billData.note || null,
          orderDate: billData.orderDate || null,
          deliveryDate: billData.deliveryDate || null,
          advancePayment: billData.advancePayment || null,
          lines: {
            create: lines.map((l) => ({
              itemId: l.itemId,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              buyingPrice: l.buyingPrice,
              discountAmount: l.discountAmount,
              discountType: l.discountType || null,
              discountValue: l.discountValue || null,
              lineTotal: l.lineTotal,
              profit: l.profit,
            })),
          },
        },
        include: { lines: { include: { item: true } }, customer: true, cashier: true },
      });

      // Deduct stock and create stock movements inside transaction
      for (const item of data.items) {
        try {
          await tx.item.update({
            where: { id: item.itemId },
            data: { stock: { decrement: item.quantity } },
          });
          await tx.stockMovement.create({
            data: {
              itemId: item.itemId,
              type: "sale",
              quantity: -item.quantity,
              billId: bill.id,
              note: `Sold in ${bill.billNumber}`,
            },
          });
        } catch {
          // Skip if item not in inventory (custom items)
        }
      }

      // Test hook: allows integration tests to force a failure after stock mutations.
      if (process.env.BILLING_TEST_FAIL_AFTER_STOCK === "1") {
        throw new Error("TEST_FAIL_AFTER_STOCK");
      }

      // Loyalty coins
      if (data.customerId) {
        if (data.loyaltyCoinsUsed > 0) {
          await tx.customer.update({ where: { id: data.customerId }, data: { points: { increment: -data.loyaltyCoinsUsed } } });
          await tx.loyaltyTransaction.create({
            data: {
              customerId: data.customerId,
              type: "redeem",
              coins: -data.loyaltyCoinsUsed,
              billId: bill.id,
              note: `Redeemed for ${bill.billNumber}`,
            },
          });
        }

        if (coinsEarned > 0) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + COIN_EXPIRY_DAYS);
          await tx.customer.update({ where: { id: data.customerId }, data: { points: { increment: coinsEarned } } });
          await tx.loyaltyTransaction.create({
            data: {
              customerId: data.customerId,
              type: "earn",
              coins: coinsEarned,
              billId: bill.id,
              note: `Earned from ${bill.billNumber}`,
              expiresAt,
            },
          });
        }
      }

      return { bill, coinsEarned };
    });

    return result;
  },

  holdBill: (data: { label?: string; billData: object }) => {
    return billRepo.saveHeldBill({
      label: data.label,
      data: JSON.stringify(data.billData),
    });
  },

  getHeldBills: async () => {
    const held = await billRepo.getHeldBills();
    return held.map((h) => ({ ...h, data: JSON.parse(h.data) }));
  },

  deleteHeldBill: (id: string) => {
    return billRepo.deleteHeldBill(id);
  },
};
