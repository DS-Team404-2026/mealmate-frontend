// 담당: 맞춤형 레시피 생성 및 공공데이터 연동
// 내용: GPT API 호출(프롬프트 생성), 공공데이터 API 검색, 추천 결과 반환

import { apiClient } from '../api/client';

export interface RecommendRequest {
  available_ingredients: string[];
  preference?: string[];
  health_info?: {
    bmi?: number;
    blood_pressure?: string;
    allergy?: string;
    diets?: string;
  };
  environment?: string[];
  recommendation_type: 'gpt' | 'public_data' | 'search';
}

export interface RecommendedRecipe {
  recipe_id: number;
  title: string;
  difficulty: number;
  cooking_time: number;
  calories: number;
  match_score: number;
  missing_ingredients: string[];
}

export interface RecommendResponse {
  recommendation_id: number;
  top_recipes: RecommendedRecipe[];
  status: string;
}

export interface RecipeDetailResponse {
  id: number;
  title: string;
  ingredient_lines: string;
  difficulty: number;
  cooking_time: number;
  calories: number;
}

export interface RecipeStepsResponse {
  recipe_id: number;
  steps: {
    step_number: number;
    instruction: string;
    image_url: string | null;
  }[];
}

export interface SaveRecipeBookRequest {
  recipe_id: number;
  is_favorite: boolean;
  preference: '상' | '중' | '하';
  fail_reason?: string | null;
}

export interface SavedRecipeBookResponse {
  count: number;
  bookmarks: {
    recipe_id: number;
    title: string;
    difficulty: number;
    cooking_time: number;
    preference: string;
  }[];
}

export interface RecipeFeedbackRequest {
  recommendation_id: number;
  like_dislike: number; 
  difficulty_result?: number; 
  comment?: string;
}

export const RecipeService = {
  // 1. AI 레시피 추천
  recommendRecipe: (data: RecommendRequest) => {
    return apiClient.post<RecommendResponse>('/api/v1/recipe-recommendations/', data);
  },

  // 2. 레시피 상세 정보 조회
  getRecipeDetail: (id: number) => {
    return apiClient.get<RecipeDetailResponse>(`/api/v1/recipes/${id}/`);
  },

  // 3. 조리 단계 조회
  getRecipeSteps: (id: number) => {
    return apiClient.get<RecipeStepsResponse>(`/api/v1/recipes/${id}/steps/`);
  },

  // 4. 레시피 저장 / 평가
  saveRecipeBook: (data: SaveRecipeBookRequest) => {
    return apiClient.post<{ status: string; message: string }>('/api/v1/recipe-books/', data);
  },

  // 5. 저장한 레시피 목록 조회
  getSavedRecipes: () => {
    return apiClient.get<SavedRecipeBookResponse>('/api/v1/recipe-books/');
  },

  // 6. 레시피 후기 등록
  createFeedback: (data: RecipeFeedbackRequest) => {
    return apiClient.post<{ status: string; message: string }>('/api/v1/recipe-feedback/', data);
  },

  // 7. 저장한 레시피 후기 목록 조회
  getRecipeFeedbacks: () => {
    return apiClient.get<any>('/api/v1/recipe-feedback/');
  }
};