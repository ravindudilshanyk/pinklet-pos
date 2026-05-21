import { db } from "../utils/db";

export const billRepo = {
  generateBillNumber: async () => {
    // Find the highest POS-#### bill number, regardless of insertion order.
    const bills = await db.bill.findMany({
      select: { billNumber: true },
    });

    const nextNumber = bills.reduce((highest, bill) => {
      const match = bill.billNumber.match(/^POS-(\d+)$/);
      if (!match) return highest;

      const current = Number.parseInt(match[1], 10);
      return Number.isNaN(current) ? highest : Math.max(highest, current);
    }, 0);

    return `POS-${String(nextNumber + 1).padStart(4, "0")}`;
  },

  create: async (data: {
    cashierId: string;
    customerId?: string;
    type: string;
    status?: string;
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
        billNumber,
        cashierId: billData.cashierId,
        customerId: billData.customerId || null,
        type: billData.type,
        status: billData.status || undefined,
        paymentMethod: billData.paymentMethod,
        subtotal: billData.subtotal,
        discountAmount: billData.discountAmount,
        tax: billData.tax,
        loyaltyCoinsUsed: billData.loyaltyCoinsUsed,
        loyaltyCoinsEarned: billData.loyaltyCoinsEarned,
        total: billData.total,
        amountReceived: billData.amountReceived,
        change: billData.change,
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
