import { db } from "../utils/db";

export const itemRepo = {
  findAll: (filters?: {
    categoryId?: string;
    supplierId?: string;
    lowStock?: boolean;
    outOfStock?: boolean;
  }) => {
    return db.item.findMany({
      where: {
        isActive: true,
        ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
        ...(filters?.supplierId ? { supplierId: filters.supplierId } : {}),
        ...(filters?.lowStock
          ? { stock: { lte: db.item.fields.lowStockAlert } }
          : {}),
        ...(filters?.outOfStock ? { stock: 0 } : {}),
      },
      include: { category: true, supplier: true },
      orderBy: { name: "asc" },
    });
  },

  findById: (id: string) => {
    return db.item.findUnique({
      where: { id },
      include: { category: true, supplier: true },
    });
  },

  findByBarcode: (barcode: string) => {
    return db.item.findUnique({
      where: { barcode },
      include: { category: true, supplier: true },
    });
  },

  search: (query: string) => {
    return db.item.findMany({
      where: {
        isActive: true,
        OR: [{ name: { contains: query } }, { barcode: { contains: query } }],
      },
      include: { category: true, supplier: true },
      take: 20,
    });
  },

  findAllCategories: () => {
    return db.category.findMany({ orderBy: { name: "asc" } });
  },

  createCategory: (name: string) => {
    return db.category.create({ data: { name } });
  },

  findLowStock: () => {
    return db.item
      .findMany({
        where: {
          isActive: true,
          stock: { gt: 0 },
        },
        include: { category: true, supplier: true },
      })
      .then((items) => items.filter((i) => i.stock <= i.lowStockAlert));
  },

  findOutOfStock: () => {
    return db.item.findMany({
      where: { isActive: true, stock: 0 },
      include: { category: true, supplier: true },
    });
  },

  create: (data: {
    name: string;
    barcode?: string;
    categoryId?: string;
    supplierId?: string;
    buyingPrice: number;
    sellingPrice: number;
    stock: number;
    lowStockAlert: number;
    imageUrl?: string;
  }) => {
    return db.item.create({
      data,
      include: { category: true, supplier: true },
    });
  },

  update: (
    id: string,
    data: Partial<{
      name: string;
      barcode: string;
      categoryId: string;
      supplierId: string;
      buyingPrice: number;
      sellingPrice: number;
      stock: number;
      lowStockAlert: number;
      imageUrl: string;
      isActive: boolean;
    }>,
  ) => {
    return db.item.update({
      where: { id },
      data,
      include: { category: true, supplier: true },
    });
  },

  updateStock: (id: string, quantity: number) => {
    return db.item.update({
      where: { id },
      data: { stock: { decrement: quantity } },
    });
  },

  delete: (id: string) => {
    return db.item.update({
      where: { id },
      data: { isActive: false },
    });
  },

  // Suppliers
  findAllSuppliers: () => {
    return db.supplier.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  },

  createSupplier: (data: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }) => {
    return db.supplier.create({ data });
  },

  updateSupplier: (
    id: string,
    data: Partial<{
      name: string;
      phone: string;
      email: string;
      address: string;
      notes: string;
      isActive: boolean;
    }>,
  ) => {
    return db.supplier.update({ where: { id }, data });
  },

  deleteSupplier: (id: string) => {
    return db.supplier.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
