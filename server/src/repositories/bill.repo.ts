import { db } from "../utils/db";

export const billRepo = {
  generateBillNumber: async () => {
    const count = await db.bill.count();
    return `POS-${String(count + 1).padStart(4, "0")}`;
  },

  create: async (data: {
    cashierId: string;
    customerId?: string;
    type: string;
    paymentMethod: string;
    subtotal: number;
    discountAmount: number;
    tax: number;
    loyaltyCoinsUsed: number;
    loyaltyCoinsEarned: number;
    total: number;
    amountReceived: number;
    change: number;
    note?: string;
    orderDate?: Date;
    deliveryDate?: Date;
    advancePayment?: number;
    lines: {
      itemId: string;
      quantity: number;
      unitPrice: number;
      buyingPrice: number;
      discountAmount: number;
      discountType?: string;
      discountValue?: number;
      lineTotal: number;
      profit: number;
    }[];
  }) => {
    const billNumber = await billRepo.generateBillNumber();
    const { lines, ...billData } = data;

    return db.bill.create({
      data: {
        ...billData,
        billNumber,
        lines: {
          create: lines,
        },
      },
      include: {
        lines: { include: { item: true } },
        customer: true,
        cashier: true,
      },
    });
  },

  findById: (id: string) => {
    return db.bill.findUnique({
      where: { id },
      include: {
        lines: { include: { item: true } },
        customer: true,
        cashier: true,
      },
    });
  },

  saveHeldBill: (data: { label?: string; data: string }) => {
    return db.heldBill.create({ data });
  },

  getHeldBills: () => {
    return db.heldBill.findMany({ orderBy: { createdAt: "desc" } });
  },

  deleteHeldBill: (id: string) => {
    return db.heldBill.delete({ where: { id } });
  },

  getDiscountPresets: () => {
    return db.discountPreset.findMany({ where: { isActive: true } });
  },
};
