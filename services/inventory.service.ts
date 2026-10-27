// 담당: 보유 식재료 관리
// 내용: 식재료 추가/조회/수정/삭제, 유통기한 기준 정렬, 보관 위치별 필터링

// 담당: 보유 식재료 관리
// 내용: 식재료 추가/조회/수정/삭제, 유통기한 기준 정렬, 보관 위치별 필터링

import { apiClient } from '../api/client';
import { RefrigeratorItem, StorageType, UnitType } from '../types/inventory';

export interface IngredientMaster {
  id: number;
  name: string;
  category: string;
  unit: UnitType;
  amount: number;
}

export interface AddIngredientMasterRequest {
  name: string;
  category: string;
  unit: UnitType;
  amount?: number;
}

export interface AddRefrigeratorRequest {
  user?: number;
  user_id?: number;
  ingredient?: number;
  ingredient_id?: number;
  quantity: number;
  unit: UnitType;
  storage_type: StorageType;
  expired_at: string;
}

export interface UpdateRefrigeratorRequest {
  quantity?: number;
  storage_type?: StorageType;
  expired_at?: string;
  ingredient?: number;
}

export const InventoryService = {
  // 1. 식재료 사전 검색 API (keyword 쿼리 파라미터 사용)
  searchIngredients: (keyword: string) => {
    return apiClient.get<IngredientMaster[]>('/api/v1/ingredients/', {
      params: { keyword },
    });
  },

  // 1-1. 마스터 식재료 신규 생성 API (POST /api/v1/ingredients/)[cite: 18]
  createIngredient: (data: AddIngredientMasterRequest) => {
    return apiClient.post<IngredientMaster>('/api/v1/ingredients/', data);
  },

  // 2. 냉장고 목록 조회 (필터링 파라미터 지원)
  getRefrigerators: (params?: { category?: string; storage_type?: string; expiry_status?: string }) => {
    return apiClient.get<RefrigeratorItem[]>('/api/v1/user-refrigerators/', {
      params,
    });
  },

  // 3. 냉장고 재료 추가
  addRefrigeratorItem: (data: AddRefrigeratorRequest) => {
    return apiClient.post<{ id: number; status: string; message: string }>(
      '/api/v1/user-refrigerators/',
      data
    );
  },

  // 4. 냉장고 식재료 상세 조회
  getRefrigeratorDetail: (id: number) => {
    return apiClient.get<RefrigeratorItem>(`/api/v1/user-refrigerators/${id}/`);
  },

  // 5. 냉장고 식재료 수정 (PATCH)
  updateRefrigeratorItem: (id: number, data: UpdateRefrigeratorRequest) => {
    return apiClient.patch<RefrigeratorItem>(`/api/v1/user-refrigerators/${id}/`, data);
  },

  // 6. 냉장고 식재료 삭제 (DELETE)
  deleteRefrigeratorItem: (id: number) => {
    return apiClient.delete(`/api/v1/user-refrigerators/${id}/`);
  },
};