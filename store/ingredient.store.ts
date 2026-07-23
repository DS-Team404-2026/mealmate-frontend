import { create } from 'zustand';

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  storage: '냉동' | '냉장' | '상온';
  expiryDate: string;
  image: string;
}

interface IngredientState {
  ingredients: Ingredient[];
  addIngredient: (item: Ingredient) => void;
  updateIngredient: (id: string, updatedItem: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
}

export const useIngredientStore = create<IngredientState>((set) => ({
  ingredients: [
    {
      id: 'v-1',
      name: '양배추',
      category: 'Vegetables',
      quantity: 1,
      unit: '개',
      storage: '냉장',
      expiryDate: '2026-10-29',
      image: 'https://images.unsplash.com/photo-1550082793-2734680a6026?w=400',
    },
    {
      id: 'v-2',
      name: '오이',
      category: 'Vegetables',
      quantity: 2,
      unit: '개',
      storage: '냉장',
      expiryDate: '2026-10-26',
      image: 'https://images.unsplash.com/photo-1449339854873-750e6df51303?w=400',
    },
    {
      id: 'm-1',
      name: '양갈비',
      category: 'Meat',
      quantity: 500,
      unit: 'g',
      storage: '냉동',
      expiryDate: '2026-07-20',
      image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400',
    },
    {
      id: 'demo-3',
      name: '소고기',
      category: 'Meat',
      quantity: 300,
      unit: 'g',
      storage: '냉동',
      expiryDate: '2026-06-16',
      image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400',
    },
    {
      id: 'demo-4',
      name: '사과',
      category: 'Fruits',
      quantity: 3,
      unit: '개',
      storage: '냉장',
      expiryDate: '2026-06-15',
      image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400',
    },
  ],
  addIngredient: (item) =>
    set((state) => ({ ingredients: [item, ...state.ingredients] })),
  updateIngredient: (id, updatedItem) =>
    set((state) => ({
      ingredients: state.ingredients.map((item) =>
        item.id === id ? { ...item, ...updatedItem } : item
      ),
    })),
  deleteIngredient: (id) =>
    set((state) => ({
      ingredients: state.ingredients.filter((item) => item.id !== id),
    })),
}));