import { db } from "../utils/db";

export const salesService = {
  getSales: async (filters: {
    startDate?: string;
    endDate?: string;
    cashierId?: string;
    paymentMethod?: string;
    type?: string;
    page: number;
    limit: number;
  }) => {
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (filters.cashierId) where.cashierId = filters.cashierId;
    if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;
    if (filters.type) where.type = filters.type;

    const skip = (filters.page - 1) * filters.limit;

    const [bills, total] = await Promise.all([
      db.bill.findMany({
        where,
        include: {
          cashier: { select: { id: true, name: true, role: true } },
          customer: { select: { id: true, name: true, phone: true } },
          lines: {
            include: { item: { select: { id: true, name: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: filters.limit,
      }),
      db.bill.count({ where }),
    ]);

    return {
      bills,
      pagination: {
        total,
        page: filters.page,
        limit: filters.limit,
        pages: Math.ceil(total / filters.limit),
      },
    };
  },

  getSaleById: async (id: string) => {
    return db.bill.findUnique({
      where: { id },
      include: {
        cashier: { select: { id: true, name: true, role: true } },
        customer: true,
        lines: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                marketPrice: true,
                category: { select: { name: true } },
              },
            },
          },
        },
      },
    });
  },

  getSummary: async (startDate?: string, endDate?: string) => {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const bills = await db.bill.findMany({
      where,
      include: { lines: true },
    });

    return {
      totalRevenue: bills.reduce((sum, b) => sum + b.total, 0),
      totalProfit: bills.reduce(
        (sum, b) => sum + b.lines.reduce((s, l) => s + l.profit, 0),
        0,
      ),
      totalDiscount: bills.reduce((sum, b) => sum + b.discountAmount, 0),
      totalBills: bills.length,
      totalItems: bills.reduce(
        (sum, b) => sum + b.lines.reduce((s, l) => s + l.quantity, 0),
        0,
      ),
      byPaymentMethod: bills.reduce((acc: any, b) => {
        acc[b.paymentMethod] = (acc[b.paymentMethod] || 0) + b.total;
        return acc;
      }, {}),
    };
  },

  getPreOrders: async (filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const where: any = { type: "pre_order" };

    if (filters.status && filters.status !== "all") {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.deliveryDate = {};
      if (filters.startDate)
        where.deliveryDate.gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        where.deliveryDate.lte = end;
      }
    }

    return db.bill.findMany({
      where,
      include: {
        cashier: { select: { id: true, name: true } },
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            whatsappNumber: true,
          },
        },
        lines: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                marketPrice: true,
              },
            },
          },
        },
      },
      orderBy: { deliveryDate: "asc" },
    });
  },

  getUpcomingPreOrders: async () => {
    const now = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    return db.bill.findMany({
      where: {
        type: "pre_order",
        status: { in: ["pending", "confirmed", "ready"] },
        deliveryDate: {
          gte: now,
          lte: threeDaysLater,
        },
      },
      include: {
        customer: { select: { name: true, phone: true, whatsappNumber: true } },
      },
      orderBy: { deliveryDate: "asc" },
    });
  },

  updatePreOrderStatus: async (id: string, status: string) => {
    return db.bill.update({
      where: { id },
      data: { status },
      include: {
        customer: {
          select: { id: true, name: true, phone: true, whatsappNumber: true },
        },
        lines: {
          include: { item: { select: { name: true, marketPrice: true } } },
        },
        cashier: { select: { name: true } },
      },
    });
  },

  recordBalancePayment: async (
    id: string,
    amount: number,
    paymentMethod: string,
    note?: string,
  ) => {
    const bill = await db.bill.findUnique({ where: { id } });
    if (!bill) throw new Error("Bill not found");

    const newAdvance = (bill.advancePayment || 0) + amount;

    return db.bill.update({
      where: { id },
      data: {
        advancePayment: newAdvance,
        note: note
          ? `${bill.note || ""} | Payment: Rs.${amount} (${paymentMethod}) - ${note}`
          : bill.note,
      },
      include: {
        customer: {
          select: { id: true, name: true, phone: true, whatsappNumber: true },
        },
        lines: {
          include: { item: { select: { name: true, marketPrice: true } } },
        },
        cashier: { select: { name: true } },
      },
    });
  },
};
