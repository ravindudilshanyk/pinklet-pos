import { db } from "../utils/db";

const getDateRange = (
  startDate?: string,
  endDate?: string,
  period?: string,
) => {
  const where: any = {};

  if (period === "today") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    where.createdAt = { gte: today, lt: tomorrow };
  } else if (period === "week") {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    where.createdAt = { gte: start };
  } else if (period === "month") {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    where.createdAt = { gte: start };
  } else if (period === "year") {
    const start = new Date();
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    where.createdAt = { gte: start };
  } else {
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }
  }

  return where;
};

export const reportsService = {
  getOverview: async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBills = await db.bill.findMany({
      where: { createdAt: { gte: today, lt: tomorrow } },
      include: { lines: true },
    });

    const todayRevenue = todayBills.reduce((sum, b) => sum + b.total, 0);
    const todayProfit = todayBills.reduce(
      (sum, b) => sum + b.lines.reduce((s, l) => s + l.profit, 0),
      0,
    );
    const todayBillCount = todayBills.length;
    const todayItemsSold = todayBills.reduce(
      (sum, b) => sum + b.lines.reduce((s, l) => s + l.quantity, 0),
      0,
    );
    const todayDiscount = todayBills.reduce(
      (sum, b) => sum + b.discountAmount,
      0,
    );

    const allBills = await db.bill.findMany({ include: { lines: true } });
    const totalRevenue = allBills.reduce((sum, b) => sum + b.total, 0);
    const totalProfit = allBills.reduce(
      (sum, b) => sum + b.lines.reduce((s, l) => s + l.profit, 0),
      0,
    );

    const recentBills = await db.bill.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        cashier: { select: { name: true } },
        customer: { select: { name: true } },
        lines: { include: { item: { select: { name: true } } } },
      },
    });

    const allItems = await db.item.findMany({
      where: { isActive: true },
      include: { supplier: { select: { name: true, phone: true } } },
    });
    const lowStockItems = allItems
      .filter((i) => i.stock <= i.lowStockAlert)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);

    const totalCustomers = await db.customer.count();
    const totalLoyaltyCoins = await db.customer.aggregate({
      _sum: { points: true },
    });

    const paymentBreakdown = todayBills.reduce((acc: any, b) => {
      acc[b.paymentMethod] = (acc[b.paymentMethod] || 0) + b.total;
      return acc;
    }, {});

    return {
      today: {
        revenue: todayRevenue,
        profit: todayProfit,
        bills: todayBillCount,
        itemsSold: todayItemsSold,
        discount: todayDiscount,
        paymentBreakdown,
      },
      allTime: {
        revenue: totalRevenue,
        profit: totalProfit,
        bills: allBills.length,
      },
      recentBills,
      lowStockItems,
      customers: {
        total: totalCustomers,
        totalCoins: totalLoyaltyCoins._sum.points || 0,
      },
    };
  },

  getSalesChart: async (days: number) => {
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const bills = await db.bill.findMany({
        where: { createdAt: { gte: date, lt: nextDate } },
        include: { lines: true },
      });

      result.push({
        date: date.toLocaleDateString("en-LK", {
          month: "short",
          day: "numeric",
        }),
        revenue: bills.reduce((sum, b) => sum + b.total, 0),
        profit: bills.reduce(
          (sum, b) => sum + b.lines.reduce((s, l) => s + l.profit, 0),
          0,
        ),
        bills: bills.length,
      });
    }
    return result;
  },

  getTopItems: async (limit: number) => {
    const lines = await db.billLine.findMany({
      include: {
        item: {
          select: {
            id: true,
            name: true,
            sellingPrice: true,
            imageUrl: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    const itemMap: Record<string, any> = {};
    lines.forEach((line) => {
      if (!itemMap[line.itemId]) {
        itemMap[line.itemId] = {
          name: line.item.name,
          category: line.item.category?.name,
          quantity: 0,
          revenue: 0,
          profit: 0,
          imageUrl: line.item.imageUrl,
        };
      }
      itemMap[line.itemId].quantity += line.quantity;
      itemMap[line.itemId].revenue += line.lineTotal;
      itemMap[line.itemId].profit += line.profit;
    });

    return Object.entries(itemMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  },

  getSummary: async (filters: {
    startDate?: string;
    endDate?: string;
    period?: string;
  }) => {
    const where = getDateRange(
      filters.startDate,
      filters.endDate,
      filters.period,
    );

    const bills = await db.bill.findMany({
      where,
      include: { lines: true },
    });

    const revenue = bills.reduce((sum, b) => sum + b.total, 0);
    const profit = bills.reduce(
      (sum, b) => sum + b.lines.reduce((s, l) => s + l.profit, 0),
      0,
    );
    const discount = bills.reduce((sum, b) => sum + b.discountAmount, 0);
    const itemsSold = bills.reduce(
      (sum, b) => sum + b.lines.reduce((s, l) => s + l.quantity, 0),
      0,
    );
    const avgBillValue = bills.length > 0 ? revenue / bills.length : 0;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      revenue,
      profit,
      discount,
      bills: bills.length,
      itemsSold,
      avgBillValue,
      profitMargin,
    };
  },

  getCashierPerformance: async (startDate?: string, endDate?: string) => {
    const where = getDateRange(startDate, endDate);

    const bills = await db.bill.findMany({
      where,
      include: {
        cashier: { select: { id: true, name: true, role: true } },
        lines: true,
      },
    });

    const cashierMap: Record<string, any> = {};

    bills.forEach((bill) => {
      const id = bill.cashierId;
      if (!cashierMap[id]) {
        cashierMap[id] = {
          id,
          name: bill.cashier.name,
          role: bill.cashier.role,
          bills: 0,
          revenue: 0,
          profit: 0,
          itemsSold: 0,
        };
      }
      cashierMap[id].bills += 1;
      cashierMap[id].revenue += bill.total;
      cashierMap[id].profit += bill.lines.reduce((s, l) => s + l.profit, 0);
      cashierMap[id].itemsSold += bill.lines.reduce(
        (s, l) => s + l.quantity,
        0,
      );
    });

    return Object.values(cashierMap).sort((a, b) => b.revenue - a.revenue);
  },

  getPaymentBreakdown: async (startDate?: string, endDate?: string) => {
    const where = getDateRange(startDate, endDate);

    const bills = await db.bill.findMany({ where });

    const breakdown: Record<string, { count: number; total: number }> = {};

    bills.forEach((bill) => {
      if (!breakdown[bill.paymentMethod]) {
        breakdown[bill.paymentMethod] = { count: 0, total: 0 };
      }
      breakdown[bill.paymentMethod].count += 1;
      breakdown[bill.paymentMethod].total += bill.total;
    });

    const total = bills.reduce((sum, b) => sum + b.total, 0);

    return Object.entries(breakdown).map(([method, data]) => ({
      method,
      count: data.count,
      total: data.total,
      percentage: total > 0 ? (data.total / total) * 100 : 0,
    }));
  },

  getCategoryBreakdown: async (startDate?: string, endDate?: string) => {
    const where = getDateRange(startDate, endDate);

    const bills = await db.bill.findMany({
      where,
      include: {
        lines: {
          include: {
            item: {
              select: { category: { select: { name: true } } },
            },
          },
        },
      },
    });

    const categoryMap: Record<string, { revenue: number; quantity: number }> =
      {};

    bills.forEach((bill) => {
      bill.lines.forEach((line) => {
        const cat = line.item.category?.name || "Uncategorized";
        if (!categoryMap[cat]) categoryMap[cat] = { revenue: 0, quantity: 0 };
        categoryMap[cat].revenue += line.lineTotal;
        categoryMap[cat].quantity += line.quantity;
      });
    });

    const total = Object.values(categoryMap).reduce(
      (sum, c) => sum + c.revenue,
      0,
    );

    return Object.entries(categoryMap)
      .map(([name, data]) => ({
        name,
        revenue: data.revenue,
        quantity: data.quantity,
        percentage: total > 0 ? (data.revenue / total) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  },
};
