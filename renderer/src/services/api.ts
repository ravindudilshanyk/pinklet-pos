import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

const api = axios.create({
  baseURL: "http://localhost:3001/api/v1",
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      if (window.location.protocol === "file:") {
        window.location.hash = "#/auth";
      } else {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
