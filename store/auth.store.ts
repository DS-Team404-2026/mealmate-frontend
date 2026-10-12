// 📁 store/auth.store.ts
import { create } from 'zustand';
import { apiClient } from '@/api/client';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

interface User {
  user_id: number;
  email: string;
  nickname: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (payload: any) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,

  // 🔐 로그인 연동
  login: async (email, password) => {
    try {
      set({ isLoading: true });
      // API 명세서대로 /api/v1/users/login/ 에 POST 요청
      const response = await apiClient.post('/api/v1/users/login/', {
        email,
        password,
      });

      if (response.status === 200) {
        const { access_token, refresh_token, user } = response.data;
        
        // 토큰을 스마트폰의 안전한 저장소에 보관
        await SecureStore.setItemAsync('access_token', access_token);
        await SecureStore.setItemAsync('refresh_token', refresh_token);
        
        set({ user, isLoading: false });
        return true;
      }
      return false;
    } catch (error: any) {
      set({ isLoading: false });
      const status = error.response?.status;
      
      if (status === 400) Alert.alert('로그인 실패', '입력값을 확인해주세요.');
      else if (status === 401) Alert.alert('로그인 실패', '이메일 또는 비밀번호가 일치하지 않습니다.');
      else Alert.alert('오류', '서버와 연결할 수 없습니다.');
      return false;
    }
  },

  // 📝 회원가입 연동
  signup: async (payload) => {
    try {
      set({ isLoading: true });
      // API 명세서대로 /api/v1/users/signup/ 에 POST 요청
      const response = await apiClient.post('/api/v1/users/signup/', payload);

      if (response.status === 201) {
        Alert.alert('가입 완료', response.data.message || '회원가입이 완료되었습니다.');
        set({ isLoading: false });
        return true;
      }
      return false;
    } catch (error: any) {
      set({ isLoading: false });
      const status = error.response?.status;

      if (status === 400) Alert.alert('가입 실패', '입력값 오류 또는 비밀번호가 일치하지 않습니다.');
      else if (status === 409) Alert.alert('가입 실패', '이미 가입된 이메일입니다.');
      else Alert.alert('오류', '서버와 연결할 수 없습니다.');
      return false;
    }
  },
}));