// 식재료의 카테고리(육류, 채소 등), 보관 위치, 수량 단위 등의 타입을 정의

export type StorageType = '냉장' | '냉동' | '상온';
export type UnitType = 'g' | 'kg' | 'ml' | 'L' | '개' | '팩';

export interface RefrigeratorItem {
  id: number;
  user?: number;
  ingredient?: number;
  quantity?: number;
  storage_type: StorageType;
  expired_at: string;
  d_day?: number;
  
  // 백엔드 API 응답 호환 필드
  name?: string;
  ingredient_name?: string;
  category?: string;
  ingredient_category?: string;
  unit?: UnitType;
  ingredient_unit?: UnitType;
  quantity_display?: string;
}