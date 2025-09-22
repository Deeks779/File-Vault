import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const privateApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export const publicApi = axios.create({
  baseURL: API_BASE_URL,
});
privateApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = token;
  return config;
});
export const adminApi = axios.create({
  baseURL: API_BASE_URL,
});
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = token;
  return config;
});

