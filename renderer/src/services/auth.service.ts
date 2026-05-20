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
  sendForgotPasswordOTP: (email: string) =>
    api.post("/auth/forgot-password/send-otp", { email }).then((r) => r.data),

  verifyForgotPasswordOTP: (email: string, otp: string) =>
    api
      .post("/auth/forgot-password/verify-otp", { email, otp })
      .then((r) => r.data),

  resetPassword: (email: string, resetToken: string, newPassword: string) =>
    api
      .post("/auth/forgot-password/reset", { email, resetToken, newPassword })
      .then((r) => r.data),

  sendChangePasswordOTP: () =>
    api.post("/auth/change-password/send-otp").then((r) => r.data),

  changePasswordWithOTP: (
    otp: string,
    newPassword: string,
    confirmPassword: string,
  ) =>
    api
      .post("/auth/change-password/verify", {
        otp,
        newPassword,
        confirmPassword,
      })
      .then((r) => r.data),
};
