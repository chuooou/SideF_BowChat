import axios, { type AxiosInstance } from "axios";
import { useAuthStore } from "../store/authStore";

const env = import.meta.env;

export const apiBaseUrls = {
  user: env.VITE_USER_API_URL ?? "http://localhost:8081",
  product: env.VITE_PRODUCT_API_URL ?? "http://localhost:8082",
  auction: env.VITE_AUCTION_API_URL ?? "http://localhost:8083",
  chat: env.VITE_CHAT_API_URL ?? "http://localhost:8084",
  chatWs: env.VITE_CHAT_WS_URL ?? "ws://localhost:8084",
};

const createClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
};

export const userApi = createClient(apiBaseUrls.user);
export const productApi = createClient(apiBaseUrls.product);
export const auctionApi = createClient(apiBaseUrls.auction);
export const chatApi = createClient(apiBaseUrls.chat);
