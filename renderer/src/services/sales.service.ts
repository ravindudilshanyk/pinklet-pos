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

  getSummary: (startDate?: string, endDate?: string) => {
    const q = new URLSearchParams();
    if (startDate) q.append("startDate", startDate);
    if (endDate) q.append("endDate", endDate);
    return api.get(`/sales/summary?${q.toString()}`).then((r) => r.data.data);
  },
};
