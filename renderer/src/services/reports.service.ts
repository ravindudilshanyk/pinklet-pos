import api from "./api";

export const reportsService = {
  getSummary: (params?: {
    startDate?: string;
    endDate?: string;
    period?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.startDate) q.append("startDate", params.startDate);
    if (params?.endDate) q.append("endDate", params.endDate);
    if (params?.period) q.append("period", params.period);
    return api.get(`/reports/summary?${q.toString()}`).then((r) => r.data.data);
  },

  getSalesChart: (days = 30) =>
    api.get(`/reports/sales-chart?days=${days}`).then((r) => r.data.data),

  getTopItems: (limit = 10) =>
    api.get(`/reports/top-items?limit=${limit}`).then((r) => r.data.data),

  getCashierPerformance: (startDate?: string, endDate?: string) => {
    const q = new URLSearchParams();
    if (startDate) q.append("startDate", startDate);
    if (endDate) q.append("endDate", endDate);
    return api
      .get(`/reports/cashier-performance?${q.toString()}`)
      .then((r) => r.data.data);
  },

  getPaymentBreakdown: (startDate?: string, endDate?: string) => {
    const q = new URLSearchParams();
    if (startDate) q.append("startDate", startDate);
    if (endDate) q.append("endDate", endDate);
    return api
      .get(`/reports/payment-breakdown?${q.toString()}`)
      .then((r) => r.data.data);
  },

  getCategoryBreakdown: (startDate?: string, endDate?: string) => {
    const q = new URLSearchParams();
    if (startDate) q.append("startDate", startDate);
    if (endDate) q.append("endDate", endDate);
    return api
      .get(`/reports/category-breakdown?${q.toString()}`)
      .then((r) => r.data.data);
  },
};
