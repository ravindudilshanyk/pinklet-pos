import { billRepo } from "../repositories/bill.repo";
import { itemRepo } from "../repositories/item.repo";
import { customerRepo } from "../repositories/customer.repo";
import { db } from "../utils/db";

const COINS_PER_AMOUNT = 1000;
const COIN_VALUE = 1;
const MIN_BILL_FOR_REDEMPTION = 200;
const COIN_EXPIRY_DAYS = 365;

export const billingService = {
  getDiscountPresets: () => {
    return billRepo.getDiscountPresets();
  },

  completeBill: async (data: {
    cashierId: string;
    customerId?: string;
    type: string;
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
    orderDate?: Date;
    deliveryDate?: Date;
    advancePayment?: number;
  }) => {
    // Calculate profit per line
    const lines = data.items.map((item) => ({
      ...item,
      profit:
        (item.unitPrice - item.buyingPrice) * item.quantity -
        item.discountAmount,
    }));

    // Calculate loyalty coins earned
    const coinsEarned = Math.floor(data.total / COINS_PER_AMOUNT);

    // Create bill
    const bill = await billRepo.create({
      ...data,
      lines,
      loyaltyCoinsEarned: coinsEarned,
    });

    // Deduct stock for each item
    for (const item of data.items) {
      await itemRepo.updateStock(item.itemId, item.quantity);

      // Record stock movement
      await db.stockMovement.create({
        data: {
          itemId: item.itemId,
          type: "sale",
          quantity: -item.quantity,
          billId: bill.id,
          note: `Sold in bill ${bill.billNumber}`,
        },
      });
    }

    // Handle loyalty coins
    if (data.customerId) {
      // Deduct redeemed coins
      if (data.loyaltyCoinsUsed > 0) {
        await customerRepo.updatePoints(
          data.customerId,
          -data.loyaltyCoinsUsed,
        );
        await customerRepo.addLoyaltyTransaction({
          customerId: data.customerId,
          type: "redeem",
          coins: -data.loyaltyCoinsUsed,
          billId: bill.id,
          note: `Redeemed for bill ${bill.billNumber}`,
        });
      }

      // Add earned coins
      if (coinsEarned > 0) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + COIN_EXPIRY_DAYS);

        await customerRepo.updatePoints(data.customerId, coinsEarned);
        await customerRepo.addLoyaltyTransaction({
          customerId: data.customerId,
          type: "earn",
          coins: coinsEarned,
          billId: bill.id,
          note: `Earned from bill ${bill.billNumber}`,
          expiresAt,
        });
      }
    }

    return { bill, coinsEarned };
  },

  holdBill: (data: { label?: string; billData: object }) => {
    return billRepo.saveHeldBill({
      label: data.label,
      data: JSON.stringify(data.billData),
    });
  },

  getHeldBills: async () => {
    const held = await billRepo.getHeldBills();
    return held.map((h) => ({
      ...h,
      data: JSON.parse(h.data),
    }));
  },

  deleteHeldBill: (id: string) => {
    return billRepo.deleteHeldBill(id);
  },
};
