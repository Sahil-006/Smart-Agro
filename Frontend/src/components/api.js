import axios from "axios";

export const API_BASE_URL =
  typeof import.meta.env.VITE_API_URL === "string"
    ? import.meta.env.VITE_API_URL
    : (import.meta.env.DEV ? "http://localhost:5000" : "");

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("smart_agro_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Ignore localStorage access errors
  }
  return config;
});

export default api;
