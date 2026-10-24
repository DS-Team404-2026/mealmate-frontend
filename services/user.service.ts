// 담당: 마이페이지 정보 및 건강/취향 데이터
// 내용: BMI 계산, 질환 정보 업데이트, 요리 실력/주거 환경 정보 관리

// 1. apiClient 부분에 중괄호 { } 를 추가합니다.
import { apiClient } from '../api/client'; 
import { UserProfile, UserEnvironment, UserHealthProfile } from '../types/user';

export const UserService = {
  getProfile: () => apiClient.get<UserProfile>('/api/v1/user-profiles/'),
  updateProfile: (data: Partial<UserProfile>) => apiClient.patch('/api/v1/user-profiles/', data),

  getEnvironment: () => apiClient.get<UserEnvironment>('/api/v1/user-environments/'),
  updateEnvironment: (data: Partial<UserEnvironment>) => apiClient.patch('/api/v1/user-environments/', data),

  getHealthProfile: () => apiClient.get<UserHealthProfile>('/api/v1/user-health-profiles/'),
  updateHealthProfile: (data: Partial<UserHealthProfile>) => apiClient.patch('/api/v1/user-health-profiles/', data),
};