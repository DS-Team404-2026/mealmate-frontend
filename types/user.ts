// 건강 수치(BMI), 질환 정보, 입맛 취향 등 마이페이지에 들어갈 복잡한 데이터 타입을 정의

// types/user.ts

export interface UserProfile {
  profile_id?: number;
  user_id?: number;
  email?: string;
  nickname: string;
  cooking_level: number;
  housing: string;
  preference: string[];
}

export interface UserEnvironment {
  user_id?: number;
  induction: boolean;
  microwave: boolean;
  airfryer: boolean;
  blender: boolean;
}

export interface UserHealthProfile {
  user_id?: number;
  height: number | null;
  weight: number | null;
  bmi?: number;
  blood_pressure: string;
  diseases: string[];      
  allergen: string;        
  diets: string[];       
}