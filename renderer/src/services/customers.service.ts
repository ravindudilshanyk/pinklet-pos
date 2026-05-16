import api from "./api";

export const customersService = {
  getAll: () => api.get("/customers").then((r) => r.data.data),

  search: (q: string) =>
    api.get(`/customers/search?q=${q}`).then((r) => r.data.data),

  getById: (id: string) => api.get(`/customers/${id}`).then((r) => r.data.data),

  getBills: (id: string) =>
    api.get(`/customers/${id}/bills`).then((r) => r.data.data),

  create: (data: object) =>
    api.post("/customers", data).then((r) => r.data.data),

  update: (id: string, data: object) =>
    api.put(`/customers/${id}`, data).then((r) => r.data.data),

  delete: (id: string) =>
    api.delete(`/customers/${id}`).then((r) => r.data.data),
};
