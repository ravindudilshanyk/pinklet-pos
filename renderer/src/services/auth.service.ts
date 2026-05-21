import api from "./api";

export const authService = {
  getSetupStatus: () =>
    api.get("/auth/setup-status").then((r) => {
      const data = r.data.data || r.data;
      return {
        setupComplete: data.setupComplete ?? data.ownerExists ?? false,
        ownerExists: data.setupComplete ?? data.ownerExists ?? false,
      };
    }),

  getAccounts: () => api.get("/auth/accounts").then((r) => r.data.data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data).then((r) => r.data.data),

  cashierLogin: (data: { userId: string; password: string }) =>
    api.post("/auth/cashier-login", data).then((r) => r.data.data),

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
