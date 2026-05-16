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

    // Create bill with lines — never pass items to repo
    const bill = await billRepo.create({
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
      orderDate: data.orderDate,
      deliveryDate: data.deliveryDate,
      advancePayment: data.advancePayment,
      lines,
    });

    // Deduct stock
    for (const item of data.items) {
      try {
        await itemRepo.updateStock(item.itemId, item.quantity);
        await db.stockMovement.create({
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

    // Loyalty coins
    if (data.customerId) {
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
          note: `Redeemed for ${bill.billNumber}`,
        });
      }

      if (coinsEarned > 0) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + COIN_EXPIRY_DAYS);
        await customerRepo.updatePoints(data.customerId, coinsEarned);
        await customerRepo.addLoyaltyTransaction({
          customerId: data.customerId,
          type: "earn",
          coins: coinsEarned,
          billId: bill.id,
          note: `Earned from ${bill.billNumber}`,
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
    return held.map((h) => ({ ...h, data: JSON.parse(h.data) }));
  },

  deleteHeldBill: (id: string) => {
    return billRepo.deleteHeldBill(id);
  },
};
