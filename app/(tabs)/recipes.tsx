import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, FlatList } from 'react-native';
import { useIngredientStore } from '@/store/ingredient.store';
import { useRouter } from 'expo-router';
import { Colors } from "@/constants/theme";

// 기존 AI 추천 레시피 풀
const RECIPE_POOL = [
  {
    id: "r-1",
    title: "저염 소고기 사과 샐러드",
    time: "15분",
    difficulty: "초보",
    kcal: "320 kcal",
    reason: "임박한 소고기와 사과를 모두 소진할 수 있어요! 고혈압 관리를 위해 나트륨을 최소화한 식단입니다.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    tags: ["저염", "고단백", "혈압관리"],
  },
  {
    id: "r-2",
    title: "사과 소스를 곁들인 양갈비 구이",
    time: "25분",
    difficulty: "보통",
    kcal: "450 kcal",
    reason: "보관 중인 양갈비에 달콤한 사과를 갈아 넣어 설탕 없이 자연스러운 단맛을 낸 훌륭한 저당 요리입니다.",
    image: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600&auto=format&fit=crop&q=80",
    tags: ["저당", "특식", "당뇨예방"],
  },
  {
    id: "r-3",
    title: "양배추 소고기 찜",
    time: "20분",
    difficulty: "보통",
    kcal: "280 kcal",
    reason: "소화가 잘 되는 양배추에 단백질이 풍부한 소고기를 말아 찐 건강식입니다. 위에 부담이 없고 혈당을 서서히 올립니다.",
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80",
    tags: ["위장건강", "저탄수", "포만감"],
  },
  {
    id: "r-4",
    title: "오이 소고기 볶음",
    time: "10분",
    difficulty: "초보",
    kcal: "210 kcal",
    reason: "수분이 많은 오이와 소고기를 빠르게 볶아낸 반찬입니다. 나트륨 배출을 돕고 칼륨을 보충할 수 있습니다.",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80",
    tags: ["초간단", "수분충전", "나트륨배출"],
  },
];

// 💡 [추가] 저장한 레시피 가짜 데이터
const INITIAL_SAVED_RECIPES = [
  { id: 's-1', title: '저염 소고기 사과 샐러드', time: '15분', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80' },
  { id: 's-2', title: '아삭한 오이 사과 무침', time: '5분', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80' },
];

export default function RecipeRecommendScreen() {
  const router = useRouter();
  const { ingredients } = useIngredientStore();

  // 💡 [추가] 메인 상단 탭 선택 상태 ('ai' 또는 'saved')
  const [activeTab, setActiveTab] = useState<'ai' | 'saved'>('ai');
  const [savedRecipes, setSavedRecipes] = useState(INITIAL_SAVED_RECIPES);

  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loadingText, setLoadingText] = useState('냉장고 데이터 분석 중...');
  const [currentRecommendations, setCurrentRecommendations] = useState<typeof RECIPE_POOL>([]);

  const getRandomRecipes = () => {
    const shuffled = [...RECIPE_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  };

  const handleGenerateRecipes = () => {
    setIsGenerating(true);
    setShowResults(false);
    setLoadingText('소비기한 임박 식재료 파악 중...');

    setTimeout(() => {
      setLoadingText('편도나 님의 건강 프로필(고혈압, 저염) 매핑 중...');
    }, 1000);

    setTimeout(() => {
      setLoadingText('영양 밸런스 최적화 및 레시피 구성 중...');
    }, 2500);

    setTimeout(() => {
      setCurrentRecommendations(getRandomRecipes());
      setIsGenerating(false);
      setShowResults(true);
    }, 4000);
  };

  // 💡 [추가] 저장한 레시피 삭제 함수
  const handleDeleteSaved = (id: string) => {
    setSavedRecipes(prev => prev.filter(item => item.id !== id));
  };

  return (
    <View style={styles.container}>
      {/* 헤더 영역 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>레시피 센터</Text>
        <Text style={styles.headerSub}>AI 맞춤 제안 및 내가 저장한 레시피</Text>

        {/* 💡 [추가] 상단 탭 스위치 버튼 */}
        <View style={styles.subTabContainer}>
          <TouchableOpacity
            style={[styles.subTabButton, activeTab === 'ai' && styles.subTabActive]}
            onPress={() => setActiveTab('ai')}
          >
            <Text style={[styles.subTabText, activeTab === 'ai' && styles.subTabTextActive]}>✨ AI 추천</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subTabButton, activeTab === 'saved' && styles.subTabActive]}
            onPress={() => setActiveTab('saved')}
          >
            <Text style={[styles.subTabText, activeTab === 'saved' && styles.subTabTextActive]}>📌 저장한 레시피 ({savedRecipes.length})</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 1️⃣ AI 추천 탭을 눌렀을 때 보일 화면 */}
      {activeTab === 'ai' ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.contextCard}>
            <View style={styles.contextHeader}>
              <Text style={styles.contextTitle}>현재 분석 기준 데이터</Text>
            </View>

            <View style={styles.tagSection}>
              <Text style={styles.tagLabel}>소비기한 임박 재료</Text>
              <View style={styles.tagRow}>
                {ingredients.slice(3, 5).map(item => (
                  <View key={item.id} style={styles.ingredientTag}>
                    <Text style={styles.ingredientTagText}>{item.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.tagSection}>
              <Text style={styles.tagLabel}>나의 건강 및 취향 프로필</Text>
              <View style={styles.tagRow}>
                {['1기 고혈압', '초보', '저염', '고단백'].map(tag => (
                  <View key={tag} style={styles.profileTag}>
                    <Text style={styles.profileTagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {!showResults ? (
            <View style={styles.actionArea}>
              {isGenerating ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color={Colors.light.primary} />
                  <Text style={styles.loadingText}>{loadingText}</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.generateButton} onPress={handleGenerateRecipes}>
                  <Text style={styles.generateButtonText}>나만의 레시피 추천받기</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.resultArea}>
              <Text style={styles.resultHeader}>편도나 님을 위한 추천 요리 2가지</Text>

              {currentRecommendations.map((recipe) => (
                <View key={recipe.id} style={styles.recipeCard}>
                  <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
                  <View style={styles.recipeContent}>
                    <View style={styles.recipeMetaRow}>
                      <View style={styles.metaBadge}><Text style={styles.metaBadgeText}>{recipe.time}</Text></View>
                      <View style={styles.metaBadge}><Text style={styles.metaBadgeText}>{recipe.difficulty}</Text></View>
                      <View style={styles.metaBadge}><Text style={styles.metaBadgeText}>{recipe.kcal}</Text></View>
                    </View>
                    <Text style={styles.recipeTitle}>{recipe.title}</Text>
                    <View style={styles.reasonBox}>
                      <Text style={styles.reasonTitle}>💡 추천 이유</Text>
                      <Text style={styles.reasonText}>{recipe.reason}</Text>
                    </View>
                    <View style={styles.tagRow}>
                      {recipe.tags.map(tag => (
                        <Text key={tag} style={styles.recipeTag}>#{tag}</Text>
                      ))}
                    </View>
                    <TouchableOpacity
                      style={styles.detailButton}
                      onPress={() => router.push({ pathname: "/recipes/[id]", params: { id: recipe.id } })}
                    >
                      <Text style={styles.detailButtonText}>조리 순서 보기 →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.resetButton} onPress={handleGenerateRecipes}>
                <Text style={styles.resetButtonText}>다른 레시피 다시 생성하기</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={{ height: 120 }} />
        </ScrollView>
      ) : (
        /* 2️⃣ 💡 [추가] 저장한 레시피 탭을 눌렀을 때 보일 화면 */
        <View style={styles.savedContainer}>
          {savedRecipes.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>저장된 레시피가 없습니다.</Text>
            </View>
          ) : (
            <FlatList
              data={savedRecipes}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.savedCard}>
                  <Image source={{ uri: item.image }} style={styles.savedImage} />
                  <View style={styles.savedContent}>
                    <Text style={styles.savedTitle}>{item.title}</Text>
                    <Text style={styles.savedTime}>⏱️ 조리시간: {item.time}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteSaved(item.id)}
                  >
                    <Text style={styles.deleteText}>삭제</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15, backgroundColor: Colors.light.background, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#111' },
  headerSub: { fontSize: 14, color: '#666', marginTop: 4, fontWeight: '500' },

  // Sub Tab Styles
  subTabContainer: { flexDirection: 'row', marginTop: 15, backgroundColor: '#EAEAEA', borderRadius: 12, padding: 4 },
  subTabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  subTabActive: { backgroundColor: '#fff' },
  subTabText: { fontSize: 13, fontWeight: '600', color: '#777' },
  subTabTextActive: { color: Colors.light.primary, fontWeight: '800' },

  contextCard: { margin: 20, padding: 18, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#EAEAEA', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  contextHeader: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 12, marginBottom: 12 },
  contextTitle: { fontSize: 16, fontWeight: '800', color: '#333' },
  tagSection: { marginBottom: 12 },
  tagLabel: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  ingredientTag: { backgroundColor: '#FFF5E5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#FFE4B5' },
  ingredientTagText: { fontSize: 13, color: '#D97706', fontWeight: '700' },
  profileTag: { backgroundColor: '#F0F7F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  profileTagText: { fontSize: 13, color: Colors.light.primary, fontWeight: '600' },
  actionArea: { paddingHorizontal: 20, marginTop: 20, alignItems: 'center' },
  generateButton: { backgroundColor: Colors.light.primary, width: '100%', paddingVertical: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  generateButtonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  loadingBox: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { textAlign: 'center', marginTop: 16, fontSize: 14, color: Colors.light.primary, lineHeight: 22, fontWeight: '700' },
  resultArea: { paddingHorizontal: 20, marginTop: 10 },
  resultHeader: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 16 },
  recipeCard: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', marginBottom: 24, borderWidth: 1, borderColor: '#EEE', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10 },
  recipeImage: { width: '100%', height: 180, backgroundColor: '#F5F5F5' },
  recipeContent: { padding: 18 },
  recipeMetaRow: { flexDirection: 'row', marginBottom: 10 },
  metaBadge: { backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 8 },
  metaBadgeText: { fontSize: 11, color: '#666', fontWeight: '600' },
  recipeTitle: { fontSize: 20, fontWeight: '800', color: '#222', marginBottom: 12 },
  reasonBox: { backgroundColor: Colors.light.background, padding: 12, borderRadius: 10, marginBottom: 12 },
  reasonTitle: { fontSize: 13, fontWeight: '800', color: Colors.light.primary, marginBottom: 4 },
  reasonText: { fontSize: 13, color: '#444', lineHeight: 19 },
  recipeTag: { fontSize: 13, color: '#888', marginRight: 10, fontWeight: '500', marginBottom: 16 },
  detailButton: { alignSelf: 'flex-end', paddingVertical: 6 },
  detailButtonText: { color: Colors.light.primary, fontSize: 14, fontWeight: '700' },
  resetButton: { paddingVertical: 15, marginTop: 10, backgroundColor: Colors.light.background, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  resetButtonText: { fontSize: 14, color: Colors.light.primary, fontWeight: '700' },

  // Saved Recipes Tab Styles
  savedContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 15 },
  savedCard: { flexDirection: 'row', backgroundColor: '#F9F9F9', borderRadius: 12, padding: 12, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEA' },
  savedImage: { width: 60, height: 60, borderRadius: 8 },
  savedContent: { flex: 1, marginLeft: 12 },
  savedTitle: { fontSize: 15, fontWeight: '700', color: '#222' },
  savedTime: { fontSize: 12, color: '#666', marginTop: 4 },
  deleteButton: { padding: 8 },
  deleteText: { color: '#FF4D4D', fontSize: 12, fontWeight: '700' },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#999', fontSize: 14 }
