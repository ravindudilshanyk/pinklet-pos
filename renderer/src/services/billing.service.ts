import api from "./api";

export const billService = {
  getItems: (categoryId?: string, search?: string) => {
    const params = new URLSearchParams();
    if (categoryId) params.append("categoryId", categoryId);
    if (search) params.append("search", search);
    return api.get(`/items?${params.toString()}`).then((r) => r.data.data);
  },

  getCategories: () => {
    return api.get("/items/categories").then((r) => r.data.data);
  },

  getDiscountPresets: () => {
    return api.get("/billing/presets").then((r) => r.data.data);
  },

  searchCustomers: (q: string) => {
    return api.get(`/customers/search?q=${q}`).then((r) => r.data.data);
  },

  completeBill: (data: object) => {
    return api.post("/billing/complete", data).then((r) => r.data.data);
  },

  holdBill: (data: object) => {
    return api.post("/billing/hold", data).then((r) => r.data.data);
  },

  getHeldBills: () => {
    return api.get("/billing/held").then((r) => r.data.data);
  },

  deleteHeldBill: (id: string) => {
    return api.delete(`/billing/held/${id}`).then((r) => r.data.data);
  },
};
