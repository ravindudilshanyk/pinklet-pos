import { db } from "../utils/db";
import bcrypt from "bcryptjs";

// Simple key-value settings store using a JSON file approach
// We'll use a dedicated table approach via a simple model
const SETTINGS_KEY = "shop_settings";

const defaultSettings = {
  shopName: "Pinklet POS",
  shopAddress: "",
  shopPhone: "",
  shopEmail: "",
  currency: "LKR",
  currencySymbol: "Rs.",
  taxRate: 0,
  taxName: "Tax",
  receiptFooter: "Thank you for shopping with us! 🎀",
  loyaltyCoinsPerAmount: 1000,
  coinValue: 1,
  minBillForRedemption: 200,
};

// Store settings in a simple way using the DB
let cachedSettings: any = null;

export const settingsService = {
  getShopSettings: async () => {
    // For now store in memory with defaults
    // In production this would be a Settings model in DB
    return cachedSettings || defaultSettings;
  },

  updateShopSettings: async (data: any) => {
    cachedSettings = { ...(cachedSettings || defaultSettings), ...data };
    return cachedSettings;
  },

  getCashiers: async () => {
    return db.user.findMany({
      where: { role: "cashier" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { bills: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  createCashier: async (data: {
    name: string;
    email?: string;
    password: string;
  }) => {
    if (data.email) {
      const existing = await db.user.findUnique({
        where: { email: data.email },
      });
      if (existing) throw new Error("EMAIL_EXISTS");
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    return db.user.create({
      data: {
        name: data.name,
        email: data.email || null,
        password: hashedPassword,
        role: "cashier",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  },

  updateCashier: async (
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
    },
  ) => {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    return db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  },

  toggleCashier: async (id: string) => {
    const user = await db.user.findUnique({ where: { id } });
    if (!user) throw new Error("User not found");

    return db.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  },

  deleteCashier: async (id: string) => {
    return db.user.delete({ where: { id } });
  },

  getDiscountPresets: async () => {
    return db.discountPreset.findMany({
      orderBy: { value: "asc" },
    });
  },

  createDiscountPreset: async (data: {
    label: string;
    type: string;
    value: number;
  }) => {
    return db.discountPreset.create({ data });
  },

  updateDiscountPreset: async (
    id: string,
    data: {
      label?: string;
      type?: string;
      value?: number;
      isActive?: boolean;
    },
  ) => {
    return db.discountPreset.update({ where: { id }, data });
  },

  deleteDiscountPreset: async (id: string) => {
    return db.discountPreset.delete({ where: { id } });
  },
};
