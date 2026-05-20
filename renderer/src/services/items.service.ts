import api from "./api";

export const itemsService = {
  getItems: (params?: {
    categoryId?: string;
    supplierId?: string;
    search?: string;
    filter?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.categoryId) q.append("categoryId", params.categoryId);
    if (params?.supplierId) q.append("supplierId", params.supplierId);
    if (params?.search) q.append("search", params.search);
    if (params?.filter) q.append("filter", params.filter);
    return api.get(`/items?${q.toString()}`).then((r) => r.data.data);
  },

  getCategories: () => api.get("/items/categories").then((r) => r.data.data),

  createCategory: (name: string) =>
    api.post("/items/categories", { name }).then((r) => r.data.data),

  getSuppliers: () => api.get("/items/suppliers").then((r) => r.data.data),

  createSupplier: (data: object) =>
    api.post("/items/suppliers", data).then((r) => r.data.data),

  updateSupplier: (id: string, data: object) =>
    api.put(`/items/suppliers/${id}`, data).then((r) => r.data.data),

  deleteSupplier: (id: string) =>
    api.delete(`/items/suppliers/${id}`).then((r) => r.data.data),

  createItem: (data: object) =>
    api.post("/items", data).then((r) => r.data.data),

  updateItem: (id: string, data: object) =>
    api.put(`/items/${id}`, data).then((r) => r.data.data),

  deleteItem: (id: string) =>
    api.delete(`/items/${id}`).then((r) => r.data.data),

  adjustStock: (id: string, quantity: number, note?: string) =>
    api
      .post(`/items/${id}/adjust-stock`, { quantity, note })
      .then((r) => r.data.data),

  getLowStock: () => api.get("/items/low-stock").then((r) => r.data.data),

  getWasteLogs: () => api.get("/items/waste-logs").then((r) => r.data.data),

  createWasteLog: (data: {
    itemId: string;
    quantity: number;
    reason: string;
    note?: string;
  }) => api.post("/items/waste-logs", data).then((r) => r.data.data),

  deleteWasteLog: (id: string) =>
    api.delete(`/items/waste-logs/${id}`).then((r) => r.data.data),
};
