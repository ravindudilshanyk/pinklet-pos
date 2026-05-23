import api from "./api";

export const settingsService = {
  getShopSettings: () => api.get("/settings/shop").then((r) => r.data.data),

  updateShopSettings: (data: object) =>
    api.put("/settings/shop", data).then((r) => r.data.data),

  getCashiers: () => api.get("/settings/cashiers").then((r) => r.data.data),

  createCashier: (data: object) =>
    api.post("/settings/cashiers", data).then((r) => r.data.data),

  updateCashier: (id: string, data: object) =>
    api.put(`/settings/cashiers/${id}`, data).then((r) => r.data.data),

  toggleCashier: (id: string) =>
    api.patch(`/settings/cashiers/${id}/toggle`).then((r) => r.data.data),

  deleteCashier: (id: string) =>
    api.delete(`/settings/cashiers/${id}`).then((r) => r.data.data),

  getDiscountPresets: () =>
    api.get("/settings/discounts").then((r) => r.data.data),

  createDiscountPreset: (data: object) =>
    api.post("/settings/discounts", data).then((r) => r.data.data),

  updateDiscountPreset: (id: string, data: object) =>
    api.put(`/settings/discounts/${id}`, data).then((r) => r.data.data),

  deleteDiscountPreset: (id: string) =>
    api.delete(`/settings/discounts/${id}`).then((r) => r.data.data),

  downloadBackup: () => {
    window.open(
      "http://localhost:3001/api/v1/settings/backup/download",
      "_blank",
    );
  },

  createAutoBackup: () =>
    api.post("/settings/backup/auto").then((r) => r.data.data),

  listBackups: () => api.get("/settings/backup/list").then((r) => r.data.data),

  restoreBackup: (filename: string) =>
    api.post("/settings/backup/restore", { filename }).then((r) => r.data.data),
};
