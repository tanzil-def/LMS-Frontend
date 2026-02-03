// src/api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
let TOKEN = localStorage.getItem("token") || null;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Update token
export const setToken = (newToken) => {
  TOKEN = newToken;
  localStorage.setItem("token", newToken);
  api.defaults.headers.Authorization = `Bearer ${newToken}`;
};

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = TOKEN || localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api; 