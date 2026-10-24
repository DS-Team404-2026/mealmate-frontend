// 📁 api/client.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// 🚨 주의: 반드시 방금 찾은 본인 PC의 IPv4 주소로 변경하세요! (포스트맨 주소인 127.0.0.1 금지)
const API_BASE_URL = 'http://192.168.45.14:8000';  

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 모든 API 요청을 보낼 때, 저장된 토큰이 있으면 자동으로 헤더에 넣어주는 로직
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);