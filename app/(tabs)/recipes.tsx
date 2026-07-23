import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { useIngredientStore } from '@/store/ingredient.store';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THEME_GREEN = '#417D7A';
const LIGHT_BG = '#F4F9F8';

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
  {
    id: "r-5",
    title: "건강식 소고기 사과 카레",
    time: "30분",
    difficulty: "숙련",
    kcal: "380 kcal",
    reason: "사과의 천연 단맛을 활용해 염분과 당을 확 낮춘 일본식 카레입니다. 한 끼 식사로 영양 밸런스가 뛰어납니다.",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93cb0?w=600&auto=format&fit=crop&q=80",
    tags: ["균형잡힌", "아이들입맛", "풍성한"],
  },
  {
    id: "r-6",
    title: "소고기 채소 듬뿍 샌드위치",
    time: "15분",
    difficulty: "초보",
    kcal: "340 kcal",
    reason: "바쁜 아침에 소고기와 냉장고 속 자투리 채소를 활용해 뚝딱 만들 수 있는 고단백 샌드위치입니다.",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80",
    tags: ["아침식사", "간편한", "냉장고파먹기"],
  },
  {
    id: "r-7",
    title: "아삭한 오이 사과 무침",
    time: "5분",
    difficulty: "초보",
    kcal: "95 kcal",
    reason: "불을 쓰지 않고 오이와 사과만으로 만드는 초간단 생채입니다. 식사 시 혈당 스파이크를 막아주는 좋은 애피타이저입니다.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
    tags: ["초간단", "다이어트", "상큼한"],
  },
  {
    id: "r-8",
    title: "양배추 사과 클렌즈 주스",
    time: "5분",
    difficulty: "초보",
    kcal: "120 kcal",
    reason: "소화불량과 붓기 완화에 탁월한 클렌즈 주스입니다. 고혈압 환자의 아침 공복 혈당 관리에도 매우 좋습니다.",
    image: "https://images.unsplash.com/photo-1610970881699-44a5587ce578?w=600&auto=format&fit=crop&q=80",
    tags: ["해독", "음료", "아침대용"],
  },
];

export default function RecipeRecommendScreen() {
  const router = useRouter();
  const { ingredients } = useIngredientStore();
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI 맞춤 레시피</Text>
        <Text style={styles.headerSub}>편도나 님만을 위한 스마트 식단 제안</Text>
      </View>

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
              <ActivityIndicator size="large" color={THEME_GREEN} />
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

                {/* 💡 TS 컴파일 에러 해결: Expo Router의 정식 Object 타입 라우팅 적용 완료 */}
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: LIGHT_BG, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#111' },
  headerSub: { fontSize: 14, color: '#666', marginTop: 6, fontWeight: '500' },
  contextCard: { margin: 20, padding: 18, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#EAEAEA', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  contextHeader: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 12, marginBottom: 12 },
  contextTitle: { fontSize: 16, fontWeight: '800', color: '#333' },
  tagSection: { marginBottom: 12 },
  tagLabel: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  ingredientTag: { backgroundColor: '#FFF5E5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#FFE4B5' },
  ingredientTagText: { fontSize: 13, color: '#D97706', fontWeight: '700' },
  profileTag: { backgroundColor: '#F0F7F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  profileTagText: { fontSize: 13, color: THEME_GREEN, fontWeight: '600' },
  actionArea: { paddingHorizontal: 20, marginTop: 20, alignItems: 'center' },
  generateButton: { backgroundColor: THEME_GREEN, width: '100%', paddingVertical: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  generateButtonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  loadingBox: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { textAlign: 'center', marginTop: 16, fontSize: 14, color: '#417D7A', lineHeight: 22, fontWeight: '700' },
  resultArea: { paddingHorizontal: 20, marginTop: 10 },
  resultHeader: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 16 },
  recipeCard: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', marginBottom: 24, borderWidth: 1, borderColor: '#EEE', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10 },
  recipeImage: { width: '100%', height: 180, backgroundColor: '#F5F5F5' },
  recipeContent: { padding: 18 },
  recipeMetaRow: { flexDirection: 'row', marginBottom: 10 },
  metaBadge: { backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 8 },
  metaBadgeText: { fontSize: 11, color: '#666', fontWeight: '600' },
  recipeTitle: { fontSize: 20, fontWeight: '800', color: '#222', marginBottom: 12 },
  reasonBox: { backgroundColor: LIGHT_BG, padding: 12, borderRadius: 10, marginBottom: 12 },
  reasonTitle: { fontSize: 13, fontWeight: '800', color: THEME_GREEN, marginBottom: 4 },
  reasonText: { fontSize: 13, color: '#444', lineHeight: 19 },
  recipeTag: { fontSize: 13, color: '#888', marginRight: 10, fontWeight: '500', marginBottom: 16 },
  detailButton: { alignSelf: 'flex-end', paddingVertical: 6 },
  detailButtonText: { color: THEME_GREEN, fontSize: 14, fontWeight: '700' },
  resetButton: { paddingVertical: 15, marginTop: 10, backgroundColor: '#E8F2F1', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  resetButtonText: { fontSize: 14, color: THEME_GREEN, fontWeight: '700' }
});