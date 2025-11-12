import axios from "axios";
import { store } from "../redux/store";
import { setRefreshing, logout } from "../redux/authSlice";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants/secureStoreKeys";
import { secureStore } from "../utils/secureStore";
import { Platform } from "react-native";

const baseURL =
  Platform.OS === "android"
    ? "http://10.0.2.2:4000/api"
    : "http://localhost:4000/api";

const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await secureStore.getItem(ACCESS_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    store.dispatch(setRefreshing(true));

    try {
      const refreshToken = await secureStore.getItem(REFRESH_TOKEN);
      if (!refreshToken) throw new Error("No refresh token found");

      const { data } = await axios.post(`${baseURL}/auth/refresh`, {
        refreshToken,
      });

      const accessToken = data.accessToken || data.data?.accessToken;
      const newRefreshToken = data.refreshToken || data.data?.refreshToken;

      if (!accessToken || !newRefreshToken) {
        throw new Error("Invalid refresh token response");
      }

      await secureStore.setItem(ACCESS_TOKEN, accessToken);
      await secureStore.setItem(REFRESH_TOKEN, newRefreshToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (err) {
      console.log("Token refresh failed:", err);

      await secureStore.removeItem(ACCESS_TOKEN);
      await secureStore.removeItem(REFRESH_TOKEN);
      store.dispatch(logout());

      return Promise.reject(error);
    } finally {
      store.dispatch(setRefreshing(false));
    }
  }
);

export default apiClient;
