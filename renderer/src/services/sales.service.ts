import api from "./api";

export const salesService = {
  getSales: (params?: {
    startDate?: string;
    endDate?: string;
    cashierId?: string;
    paymentMethod?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.startDate) q.append("startDate", params.startDate);
    if (params?.endDate) q.append("endDate", params.endDate);
    if (params?.cashierId) q.append("cashierId", params.cashierId);
    if (params?.paymentMethod) q.append("paymentMethod", params.paymentMethod);
    if (params?.type) q.append("type", params.type);
    if (params?.page) q.append("page", String(params.page));
    if (params?.limit) q.append("limit", String(params.limit));
    return api.get(`/sales?${q.toString()}`).then((r) => r.data.data);
  },

  getSaleById: (id: string) => api.get(`/sales/${id}`).then((r) => r.data.data),

  getPreOrders: (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append("status", params.status);
    if (params?.startDate) q.append("startDate", params.startDate);
    if (params?.endDate) q.append("endDate", params.endDate);
    return api
      .get(`/sales/pre-orders?${q.toString()}`)
      .then((r) => r.data.data);
  },

  getUpcomingPreOrders: () =>
    api.get("/sales/pre-orders/upcoming").then((r) => r.data.data),

  updatePreOrderStatus: (id: string, status: string) =>
    api
      .patch(`/sales/pre-orders/${id}/status`, { status })
      .then((r) => r.data.data),

  recordBalancePayment: (
    id: string,
    amount: number,
    paymentMethod: string,
    note?: string,
  ) =>
    api
      .post(`/sales/pre-orders/${id}/payment`, { amount, paymentMethod, note })
      .then((r) => r.data.data),

  getSummary: (startDate?: string, endDate?: string) => {
    const q = new URLSearchParams();
    if (startDate) q.append("startDate", startDate);
    if (endDate) q.append("endDate", endDate);
    return api.get(`/sales/summary?${q.toString()}`).then((r) => r.data.data);
  },
};
