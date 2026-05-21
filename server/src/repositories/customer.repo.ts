import { db } from "../utils/db";

export const customerRepo = {
  findAll: () => {
    return db.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { bills: true } },
        bills: {
          select: {
            total: true,
            createdAt: true,
            type: true,
            status: true,
            deliveryDate: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  },

  search: (query: string) => {
    return db.customer.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { phone: { contains: query } },
          { whatsappNumber: { contains: query } },
          { email: { contains: query } },
        ],
      },
      take: 10,
      include: {
        _count: { select: { bills: true } },
      },
    });
  },

  findById: (id: string) => {
    return db.customer.findUnique({
      where: { id },
      include: {
        loyaltyTransactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: { select: { bills: true } },
      },
    });
  },

  findBills: (customerId: string) => {
    return db.bill.findMany({
      where: { customerId },
      include: {
        lines: {
          include: {
            item: { select: { name: true } },
          },
        },
        cashier: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  create: (data: {
    name: string;
    phone?: string;
    whatsappNumber?: string;
    email?: string;
    birthday?: string;
    notes?: string;
  }) => {
    return db.customer.create({
      data: {
        ...data,
        birthday: data.birthday ? new Date(data.birthday) : undefined,
      },
    });
  },

  update: (
    id: string,
    data: {
      name?: string;
      phone?: string;
      whatsappNumber?: string;
      email?: string;
      birthday?: string;
      notes?: string;
    },
  ) => {
    return db.customer.update({
      where: { id },
      data: {
        ...data,
        birthday: data.birthday ? new Date(data.birthday) : undefined,
      },
    });
  },

  delete: (id: string) => {
    return db.customer.delete({ where: { id } });
  },

  updatePoints: (id: string, points: number) => {
    return db.customer.update({
      where: { id },
      data: { points: { increment: points } },
    });
  },

  addLoyaltyTransaction: (data: {
    customerId: string;
    type: string;
    coins: number;
    billId?: string;
    note?: string;
    expiresAt?: Date;
  }) => {
    return db.loyaltyTransaction.create({ data });
  },

  getTotalSpent: async (customerId: string) => {
    const result = await db.bill.aggregate({
      where: { customerId },
      _sum: { total: true },
    });
    return result._sum.total || 0;
  },
};
