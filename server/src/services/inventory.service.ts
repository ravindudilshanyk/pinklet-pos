import { itemRepo } from "../repositories/item.repo";
import { db } from "../utils/db";

export const inventoryService = {
  getItems: (filters?: {
    categoryId?: string;
    supplierId?: string;
    search?: string;
    filter?: string;
  }) => {
    if (filters?.search) {
      return itemRepo.search(filters.search);
    }
    if (filters?.filter === "low_stock") {
      return itemRepo.findLowStock();
    }
    if (filters?.filter === "out_of_stock") {
      return itemRepo.findOutOfStock();
    }
    return itemRepo.findAll({
      categoryId: filters?.categoryId,
      supplierId: filters?.supplierId,
    });
  },

  getCategories: () => itemRepo.findAllCategories(),

  createCategory: (name: string) => itemRepo.createCategory(name),

  getSuppliers: () => itemRepo.findAllSuppliers(),

  createSupplier: (data: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }) => itemRepo.createSupplier(data),

  updateSupplier: (id: string, data: any) => itemRepo.updateSupplier(id, data),

  deleteSupplier: (id: string) => itemRepo.deleteSupplier(id),

  getItemById: (id: string) => itemRepo.findById(id),

  getItemByBarcode: (barcode: string) => itemRepo.findByBarcode(barcode),

  createItem: (data: {
    name: string;
    barcode?: string;
    categoryId?: string;
    supplierId?: string;
    buyingPrice: number;
    sellingPrice: number;
    stock: number;
    lowStockAlert: number;
    imageUrl?: string;
  }) => itemRepo.create(data),

  updateItem: (id: string, data: any) => itemRepo.update(id, data),

  deleteItem: (id: string) => itemRepo.delete(id),

  getLowStockItems: () => itemRepo.findLowStock(),

  adjustStock: async (id: string, quantity: number, note?: string) => {
    const item = await itemRepo.findById(id);
    if (!item) throw new Error("Item not found");

    await db.stockMovement.create({
      data: {
        itemId: id,
        type: "adjustment",
        quantity,
        note: note || "Manual adjustment",
      },
    });

    return itemRepo.update(id, { stock: item.stock + quantity });
  },
};
