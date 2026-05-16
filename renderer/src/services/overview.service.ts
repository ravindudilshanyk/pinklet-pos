import api from "./api";

export const overviewService = {
  getOverview: () => api.get("/reports/overview").then((r) => r.data.data),

  getSalesChart: (days = 7) =>
    api.get(`/reports/sales-chart?days=${days}`).then((r) => r.data.data),

  getTopItems: (limit = 5) =>
    api.get(`/reports/top-items?limit=${limit}`).then((r) => r.data.data),
};
