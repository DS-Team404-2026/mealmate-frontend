import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAlert } from '@/components/CustomAlert';
import { RecipeService, RecommendResponse } from '@/services/recipe.service';
import { InventoryService } from '@/services/inventory.service';
import { UserService } from '@/services/user.service';

export default function RecipeRecommendScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [activeTab, setActiveTab] = useState<'ai' | 'saved'>('ai');
  const [loading, setLoading] = useState(false);

  const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);
  const [userHealth, setUserHealth] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userEnv, setUserEnv] = useState<string[]>([]);

  const [recommendation, setRecommendation] = useState<RecommendResponse | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);

  const fetchUserData = async () => {
    try {
      const [refrigRes, healthRes, envRes, profileRes] = await Promise.all([
        InventoryService.getRefrigerators(),
        UserService.getHealthProfile(),
        UserService.getEnvironment(),
        UserService.getProfile(),
      ]);

      if (refrigRes.data) {
        const names = refrigRes.data.map((item) => item.ingredient_name || item.name || '');
        setAvailableIngredients(names.filter(Boolean));
      }
      if (healthRes.data) setUserHealth(healthRes.data);
      if (profileRes.data) setUserProfile(profileRes.data);
      if (envRes.data) {
        const envs: string[] = [];
        if (envRes.data.induction) envs.push('인덕션');
        if (envRes.data.microwave) envs.push('전자레인지');
        if (envRes.data.airfryer) envs.push('에어프라이어');
        if (envRes.data.blender) envs.push('블렌더');
        setUserEnv(envs);
      }
    } catch (error) {
      console.error('사용자 상태 로딩 에러:', error);
    }
  };

  const fetchSavedData = async () => {
    try {
      const recipesRes = await RecipeService.getSavedRecipes();
      
      if (recipesRes.data && recipesRes.data.bookmarks) {
        setSavedRecipes(recipesRes.data.bookmarks);
      }
    } catch (error) {
      console.error('저장된 데이터 조회 실패:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      fetchSavedData();
    }, [])
  );

  const handleGenerateRecipe = async () => {
    if (availableIngredients.length === 0) {
      showAlert('알림', '냉장고에 등록된 식재료가 없습니다.', 'warning');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        available_ingredients: availableIngredients,
        preference: userProfile?.preference || [],
        health_info: {
          bmi: userHealth?.bmi || 22.0,
          blood_pressure: userHealth?.blood_pressure || '정상',
          allergy: Array.isArray(userHealth?.allergies) ? userHealth.allergies.join(', ') : '없음',
          diets: '저염',
        },
        environment: userEnv,
        recommendation_type: 'gpt' as const,
      };

      const response = await RecipeService.recommendRecipe(payload);
      if (response.data && response.data.status === 'success') {
        setRecommendation(response.data);
      }
    } catch (error: any) {
      console.error('AI 추천 실패:', error);
      showAlert('추천 실패', 'AI 레시피를 생성하는 중 문제가 발생했습니다.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>나의 레시피</Text>
        <Text style={styles.headerSub}>AI 맞춤 제안 및 나의 레시피북</Text>

        <View style={styles.subTabContainer}>
          <TouchableOpacity style={[styles.subTabButton, activeTab === 'ai' && styles.subTabActive]} onPress={() => setActiveTab('ai')}>
            <Text style={[styles.subTabText, activeTab === 'ai' && styles.subTabTextActive]}>AI 추천</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.subTabButton, activeTab === 'saved' && styles.subTabActive]} onPress={() => setActiveTab('saved')}>
            <Text style={[styles.subTabText, activeTab === 'saved' && styles.subTabTextActive]}>저장 ({savedRecipes.length})</Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'ai' && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.contextCard}>
            <View style={styles.contextHeader}>
              <View style={styles.contextIconCircle}>
                <Ionicons name="analytics-outline" size={16} color={Colors.light.primary} />
              </View>
              <Text style={styles.contextTitle}>현재 실시간 분석 데이터</Text>
            </View>

            {/* 1. 보유 식재료 */}
            <View style={styles.subSectionHeader}>
              <Ionicons name="nutrition-outline" size={16} color={Colors.light.primary} />
              <Text style={styles.tagLabel}>보유 식재료 ({availableIngredients.length}개)</Text>
            </View>
            <View style={styles.tagRow}>
              {availableIngredients.slice(0, 5).map((ing, idx) => (
                <View key={`ing-${idx}`} style={styles.ingredientTag}><Text style={styles.ingredientTagText}>{ing}</Text></View>
              ))}
              {availableIngredients.length > 5 && (
                <View style={styles.ingredientTag}><Text style={styles.ingredientTagText}>+{availableIngredients.length - 5}</Text></View>
              )}
            </View>

            {/* 2. 나의 상세 프로필 */}
            <View style={[styles.subSectionHeader, { marginTop: 16 }]}>
              <Ionicons name="person-outline" size={16} color={Colors.light.primary} />
              <Text style={styles.tagLabel}>나의 프로필</Text>
            </View>
            <View style={styles.tagRow}>
              {userProfile?.housing && (
                <View style={styles.profileTag}><Text style={styles.profileTagText}>#{userProfile.housing}</Text></View>
              )}
              {userProfile?.cooking_level && (
                <View style={styles.profileTag}>
                  <Text style={styles.profileTagText}>
                    #{userProfile.cooking_level === 1 ? '요리초보' : userProfile.cooking_level === 3 ? '요리숙련' : '요리보통'}
                  </Text>
                </View>
              )}

              {userHealth?.blood_pressure && userHealth.blood_pressure !== '정상' && (
                <View style={styles.profileTag}><Text style={styles.profileTagText}>#{userHealth.blood_pressure}</Text></View>
              )}
              {userHealth?.diseases && Array.isArray(userHealth.diseases) && userHealth.diseases.map((disease: string, idx: number) => (
                <View key={`dis-${idx}`} style={styles.profileTag}><Text style={styles.profileTagText}>#{disease}</Text></View>
              ))}

              {userProfile?.preference && Array.isArray(userProfile.preference) && userProfile.preference.map((pref: string, idx: number) => (
                <View key={`pref-${idx}`} style={styles.profileTag}><Text style={styles.profileTagText}>#{pref}선호</Text></View>
              ))}

              {userEnv.map((env, idx) => (
                <View key={`env-${idx}`} style={styles.profileTag}><Text style={styles.profileTagText}>#{env}</Text></View>
              ))}
              
              {userHealth?.allergies && Array.isArray(userHealth.allergies) && userHealth.allergies.map((allergy: string, idx: number) => (
                <View key={`alg-${idx}`} style={[styles.profileTag, { backgroundColor: '#FFF2F2' }]}>
                  <Text style={[styles.profileTagText, { color: '#D32F2F' }]}>#{allergy}알러지</Text>
                </View>
              ))}
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={styles.loadingText}>맞춤 AI 레시피를 생성 중입니다...</Text>
            </View>
          ) : !recommendation ? (
            <View style={styles.actionArea}>
              <TouchableOpacity style={styles.generateButton} onPress={handleGenerateRecipe} activeOpacity={0.85}>
                <Ionicons name="sparkles-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.generateButtonText}>AI 맞춤 레시피 추천받기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.resultArea}>
              <Text style={styles.resultHeader}>추천된 맞춤 레시피 TOP</Text>
              
              {recommendation.top_recipes.map((recipe, idx) => (
                <View key={idx} style={styles.recipeCard}>
                  <View style={styles.recipeContent}>
                    <View style={styles.recipeMetaRow}>
                      <View style={styles.metaBadge}>
                        <Ionicons name="time-outline" size={13} color="#6B7378" />
                        <Text style={styles.metaBadgeText}>{recipe.cooking_time}분</Text>
                      </View>
                      <View style={styles.metaBadge}>
                        <Ionicons name="speedometer-outline" size={13} color="#6B7378" />
                        <Text style={styles.metaBadgeText}>난이도 {recipe.difficulty}</Text>
                      </View>
                      <View style={styles.metaBadge}>
                        <Ionicons name="flame-outline" size={13} color="#6B7378" />
                        <Text style={styles.metaBadgeText}>{recipe.calories} kcal</Text>
                      </View>
                      <View style={[styles.metaBadge, { backgroundColor: '#E8F2F1' }]}>
                        <Ionicons name="checkmark-circle-outline" size={13} color={Colors.light.primary} />
                        <Text style={[styles.metaBadgeText, { color: Colors.light.primary, fontWeight: '800' }]}>매칭 {recipe.match_score}%</Text>
                      </View>
                    </View>

                    <Text style={styles.recipeTitle}>{recipe.title}</Text>

                    {recipe.missing_ingredients && recipe.missing_ingredients.length > 0 && (
                      <View style={styles.missingBox}>
                        <View style={styles.missingHeader}>
                          <Ionicons name="cart-outline" size={15} color="#D32F2F" />
                          <Text style={styles.missingTitle}>부족한 재료</Text>
                        </View>
                        <Text style={styles.missingText}>{recipe.missing_ingredients.join(', ')}</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.detailButton}
                      activeOpacity={0.85}
                      onPress={() => router.push({ pathname: '/recipes/[id]', params: { id: recipe.recipe_id, recommendation_id: recommendation.recommendation_id } })}
                    >
                      <Text style={styles.detailButtonText}>조리 순서 및 상세보기</Text>
                      <Ionicons name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <TouchableOpacity style={styles.resetButton} onPress={handleGenerateRecipe}>
                <Ionicons name="refresh-outline" size={16} color="#6B7378" style={{ marginRight: 6 }} />
                <Text style={styles.resetButtonText}>다른 레시피 다시 생성하기</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {activeTab === 'saved' && (
        <View style={styles.savedContainer}>
          {savedRecipes.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="bookmark-outline" size={36} color="#C4C9CC" />
              <Text style={styles.emptyText}>저장된 레시피가 없습니다.</Text>
            </View>
          ) : (
            <FlatList
              data={savedRecipes}
              keyExtractor={(item, index) => (item.recipe_id || index).toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 120 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.savedCard} activeOpacity={0.7} onPress={() => router.push({ pathname: '/recipes/[id]', params: { id: item.recipe_id } })}>
                  <View style={styles.savedIconCircle}>
                    <Ionicons name="bookmark-outline" size={20} color={Colors.light.primary} />
                  </View>
                  <View style={styles.savedContent}>
                    <Text style={styles.savedTitle}>{item.title}</Text>
                    <Text style={styles.savedCategory}>나의 선호도: {item.preference}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#C4C9CC" />
                </TouchableOpacity>
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

  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#fff' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#111', letterSpacing: -0.6 },
  headerSub: { fontSize: 13, color: '#8A9399', marginTop: 4, fontWeight: '500' },
  subTabContainer: { flexDirection: 'row', marginTop: 18, backgroundColor: '#F4F6F6', borderRadius: 14, padding: 4 },
  subTabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 11 },
  subTabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  subTabText: { fontSize: 13, fontWeight: '600', color: '#8A9399' },
  subTabTextActive: { color: Colors.light.primary, fontWeight: '800' },

  contextCard: { marginHorizontal: 20, marginTop: 8, marginBottom: 20, padding: 18, backgroundColor: '#F4F6F6', borderRadius: 20 },
  contextHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  contextIconCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E8F2F1', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  contextTitle: { fontSize: 15, fontWeight: '800', color: '#222' },
  subSectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tagLabel: { fontSize: 13, fontWeight: '700', color: '#6B7378', marginLeft: 6 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  ingredientTag: { backgroundColor: '#fff', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 10 },
  ingredientTagText: { fontSize: 12, color: '#444', fontWeight: '700' },
  profileTag: { backgroundColor: '#E8F2F1', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 10 },
  profileTagText: { fontSize: 12, color: Colors.light.primary, fontWeight: '700' },

  actionArea: { paddingHorizontal: 20, marginTop: 4, alignItems: 'center' },
  generateButton: {
    flexDirection: 'row', backgroundColor: Colors.light.primary, width: '100%', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.light.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 4,
  },
  generateButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  loadingBox: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { textAlign: 'center', marginTop: 16, fontSize: 14, color: Colors.light.primary, lineHeight: 22, fontWeight: '700' },

  resultArea: { paddingHorizontal: 20, marginTop: 4 },
  resultHeader: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 14, letterSpacing: -0.3 },
  recipeCard: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 14, borderWidth: 1, borderColor: '#EEF0F0', padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  recipeContent: { flex: 1 },
  recipeMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F6F6', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8 },
  metaBadgeText: { fontSize: 11, color: '#6B7378', fontWeight: '600', marginLeft: 4 },
  recipeTitle: { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 12, letterSpacing: -0.4 },
  missingBox: { backgroundColor: '#FFF2F2', padding: 12, borderRadius: 12, marginBottom: 14 },
  missingHeader: { flexDirection: 'row', alignItems: 'center' },
  missingTitle: { fontSize: 12, fontWeight: '800', color: '#D32F2F', marginLeft: 5 },
  missingText: { fontSize: 12, color: '#555', marginTop: 4, lineHeight: 18 },
  detailButton: { flexDirection: 'row', backgroundColor: Colors.light.primary, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  detailButtonText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  resetButton: { flexDirection: 'row', justifyContent: 'center', height: 50, marginTop: 4, backgroundColor: '#F4F6F6', borderRadius: 14, alignItems: 'center' },
  resetButtonText: { fontSize: 14, color: '#6B7378', fontWeight: '700' },

  savedContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  savedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#EEF0F0' },
  savedIconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E8F2F1', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  savedContent: { flex: 1 },
  savedTitle: { fontSize: 16, fontWeight: '800', color: '#111', letterSpacing: -0.2 },
  savedCategory: { fontSize: 12, color: Colors.light.primary, marginTop: 4, fontWeight: '600' },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { color: '#8A9399', fontSize: 14, marginTop: 12 },
});