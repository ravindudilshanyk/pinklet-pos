import api from "./api";

export const authService = {
  getSetupStatus: async (): Promise<{ ownerExists: boolean }> => {
    const res = await api.get("/auth/setup-status");
    return res.data.data;
  },

  getAccounts: async () => {
    const res = await api.get("/auth/accounts");
    return res.data.data;
  },

  register: async (data: { name: string; email: string; password: string }) => {
    const res = await api.post("/auth/register", data);
    return res.data.data;
  },

  login: async (data: { userId: string; password: string }) => {
    const res = await api.post("/auth/login", data);
    return res.data.data;
  },
};
