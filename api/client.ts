// 📁 api/client.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = "http://172.20.5.152:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 로그인 요청을 제외한 API 요청에만 Access Token 추가
apiClient.interceptors.request.use(
  async (config) => {
    const isLoginRequest = config.url?.includes("/users/login/");

    if (!isLoginRequest) {
      const token = await SecureStore.getItemAsync("access_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);