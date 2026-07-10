import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_BASE_URL, API_TIMEOUT } from "../config/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Tự động chạy trước mỗi request.
 * Nếu trong AsyncStorage có access_token,
 * token sẽ được gắn vào Authorization header.
 */
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Chuẩn hóa xử lý response.
 * Hiện tại chỉ trả response về cho màn hình xử lý.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("user_info");
      // Note: In React Native, navigating outside of components requires a navigation ref.
      // Since we don't have it here easily, clearing the token will trigger re-render 
      // if the app uses a context to check auth state.
    }
    return Promise.reject(error);
  }
);

export default apiClient;