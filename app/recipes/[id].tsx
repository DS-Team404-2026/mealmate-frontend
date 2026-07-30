import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THEME_GREEN = '#417D7A';

// 💡 누락되었던 r-5 ~ r-8 데이터를 완벽하게 복구하여 8종의 고유 레시피를 모두 제공합니다.
const RECIPE_DETAILS_DB: Record<string, any> = {
  'r-1': {
    title: '저염 소고기 사과 샐러드',
    rating: 4.8,
    reviews: '1,240',
    matchRate: 98,
    nutrition: { kcal: 320, carbs: 24, protein: 35, fat: 12 },
    images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'],
    ingredients: [{ name: '소고기', has: true }, { name: '사과', has: true }, { name: '양상추', has: true }, { name: '발사믹', has: false }],
    steps: [
      { step: 1, title: '소고기 굽기', desc: '기름을 두르지 않은 팬에 소고기를 노릇하게 구워 한입 크기로 자릅니다.' },
      { step: 2, title: '사과 손질하기', desc: '사과는 껍질째 깨끗이 씻어 얇게 슬라이스합니다.' },
      { step: 3, title: '드레싱 만들기', desc: '저염 발사믹 식초와 올리브유를 1:1 비율로 섞어 준비합니다.' },
      { step: 4, title: '플레이팅', desc: '접시에 채소와 구운 소고기, 사과를 올리고 드레싱을 뿌려 완성합니다.' },
    ],
  },
  'r-2': {
    title: '사과 소스를 곁들인 양갈비 구이',
    rating: 4.9,
    reviews: '8,320',
    matchRate: 85,
    nutrition: { kcal: 450, carbs: 18, protein: 42, fat: 25 },
    images: ['https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=800'],
    ingredients: [{ name: '양갈비', has: true }, { name: '사과', has: true }, { name: '양파', has: true }, { name: '로즈마리', has: false }],
    steps: [
      { step: 1, title: '양갈비 마리네이드', desc: '양갈비에 올리브오일, 소금 약간, 후추를 뿌려 10분간 재워둡니다.' },
      { step: 2, title: '사과 소스 끓이기', desc: '사과와 양파를 잘게 다져 냄비에 넣고 약불에서 은근하게 졸입니다.' },
      { step: 3, title: '고기 굽기', desc: '센 불로 달군 팬에 양갈비의 겉면을 바삭하게 익히고, 약불로 줄여 속까지 익힙니다.' },
      { step: 4, title: '마무리', desc: '구운 양갈비 위에 완성된 천연 사과 소스를 듬뿍 올려냅니다.' },
    ],
  },
  'r-3': {
    title: '양배추 소고기 찜',
    rating: 4.6,
    reviews: '3,450',
    matchRate: 100,
    nutrition: { kcal: 280, carbs: 15, protein: 30, fat: 8 },
    images: ['https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800'],
    ingredients: [{ name: '소고기', has: true }, { name: '양배추', has: true }, { name: '대파', has: true }],
    steps: [
      { step: 1, title: '양배추 데치기', desc: '양배추 잎을 뜯어 끓는 물에 살짝 데쳐 부드럽게 만듭니다.' },
      { step: 2, title: '소고기 밑간', desc: '얇게 썬 소고기에 다진 파와 마늘, 간장을 소량 넣어 버무립니다.' },
      { step: 3, title: '돌돌 말기', desc: '데친 양배추 위에 양념한 소고기를 얹고 터지지 않게 돌돌 말아줍니다.' },
      { step: 4, title: '찜기에 찌기', desc: '김이 오르는 찜기에 넣고 10분~15분간 쪄내면 완성됩니다.' },
    ],
  },
  'r-4': {
    title: '오이 소고기 볶음',
    rating: 4.5,
    reviews: '1,200',
    matchRate: 90,
    nutrition: { kcal: 210, carbs: 8, protein: 25, fat: 9 },
    images: ['https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800'],
    ingredients: [{ name: '소고기', has: true }, { name: '오이', has: true }, { name: '홍고추', has: false }],
    steps: [
      { step: 1, title: '오이 절이기', desc: '오이를 동그랗게 썰어 소금에 10분간 절인 뒤 물기를 꽉 짜냅니다.' },
      { step: 2, title: '소고기 볶기', desc: '팬에 소고기를 넣고 핏기가 가실 때까지 빠르게 볶아줍니다.' },
      { step: 3, title: '함께 볶아내기', desc: '절인 오이를 넣고 센 불에서 30초간 빠르게 섞어 아삭함을 살립니다.' },
    ],
  },
  'r-5': {
    title: '건강식 소고기 사과 카레',
    rating: 4.8,
    reviews: '5,120',
    matchRate: 88,
    nutrition: { kcal: 380, carbs: 45, protein: 22, fat: 11 },
    images: ['https://images.unsplash.com/photo-1589302168068-964664d93cb0?w=800'],
    ingredients: [{ name: '소고기', has: true }, { name: '사과', has: true }, { name: '카레가루', has: false }, { name: '당근', has: false }],
    steps: [
      { step: 1, title: '재료 손질', desc: '소고기, 사과, 당근을 모두 깍둑썰기로 썰어 준비합니다.' },
      { step: 2, title: '볶기', desc: '냄비에 고기를 먼저 볶다가 겉면이 익으면 당근과 사과를 넣고 함께 볶습니다.' },
      { step: 3, title: '끓이기', desc: '물을 붓고 재료가 익을 때까지 푹 끓여줍니다.' },
      { step: 4, title: '카레 풀기', desc: '불을 끄고 카레가루를 푼 뒤, 다시 약불에서 뭉근하게 끓여냅니다.' },
    ],
  },
  'r-6': {
    title: '소고기 채소 듬뿍 샌드위치',
    rating: 4.7,
    reviews: '2,900',
    matchRate: 85,
    nutrition: { kcal: 340, carbs: 32, protein: 28, fat: 10 },
    images: ['https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800'],
    ingredients: [{ name: '소고기', has: true }, { name: '양배추', has: true }, { name: '식빵', has: false }, { name: '머스터드', has: false }],
    steps: [
      { step: 1, title: '고기 굽기', desc: '소고기는 얇게 썰어 간장 약간과 후추로 간을 한 뒤 바싹 굽습니다.' },
      { step: 2, title: '채소 준비', desc: '양배추를 얇게 채 썰고 찬물에 담갔다 빼서 아삭함을 살립니다.' },
      { step: 3, title: '빵 굽기', desc: '식빵을 마른 팬에 노릇하게 굽고 한쪽 면에 머스터드를 얇게 바릅니다.' },
      { step: 4, title: '조립하기', desc: '식빵 위에 양배추 듬뿍, 소고기를 올리고 남은 빵으로 덮어 반으로 자릅니다.' },
    ],
  },
  'r-7': {
    title: '아삭한 오이 사과 무침',
    rating: 4.9,
    reviews: '4,100',
    matchRate: 100,
    nutrition: { kcal: 95, carbs: 22, protein: 2, fat: 0 },
    images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'],
    ingredients: [{ name: '오이', has: true }, { name: '사과', has: true }, { name: '식초', has: false }],
    steps: [
      { step: 1, title: '재료 썰기', desc: '오이와 사과를 깨끗이 씻은 후 먹기 좋은 크기로 채 썰어 준비합니다.' },
      { step: 2, title: '양념장 만들기', desc: '식초, 소금 한 꼬집, 대체당(알룰로스 등)을 섞어 새콤달콤한 저염 양념을 만듭니다.' },
      { step: 3, title: '버무리기', desc: '볼에 썰어둔 오이와 사과를 담고 양념장을 부어 가볍게 버무려 완성합니다.' },
    ],
  },
  'r-8': {
    title: '양배추 사과 클렌즈 주스',
    rating: 4.5,
    reviews: '1,850',
    matchRate: 100,
    nutrition: { kcal: 120, carbs: 28, protein: 2, fat: 0 },
    images: ['https://images.unsplash.com/photo-1610970881699-44a5587ce578?w=800'],
    ingredients: [{ name: '양배추', has: true }, { name: '사과', has: true }, { name: '물', has: false }],
    steps: [
      { step: 1, title: '재료 손질', desc: '양배추는 듬성듬성 썰고, 사과는 씨를 제거한 뒤 껍질째 깍둑썰기합니다.' },
      { step: 2, title: '믹서기에 넣기', desc: '준비한 양배추와 사과를 믹서기에 넣고 물 한 컵을 붓습니다.' },
      { step: 3, title: '갈아주기', desc: '건더기가 부드러워질 때까지 충분히 갈아 컵에 따라냅니다.' },
    ],
  },
  'default': {
    title: '오이 소고기 볶음',
    rating: 4.5,
    reviews: '1,200',
    matchRate: 90,
    nutrition: { kcal: 210, carbs: 8, protein: 25, fat: 9 },
    images: ['https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800'],
    ingredients: [{ name: '소고기', has: true }, { name: '오이', has: true }, { name: '홍고추', has: false }],
    steps: [
      { step: 1, title: '오이 절이기', desc: '오이를 동그랗게 썰어 소금에 10분간 절인 뒤 물기를 꽉 짜냅니다.' },
      { step: 2, title: '소고기 볶기', desc: '팬에 소고기를 넣고 핏기가 가실 때까지 빠르게 볶아줍니다.' },
      { step: 3, title: '함께 볶아내기', desc: '절인 오이를 넣고 센 불에서 30초간 빠르게 섞어 아삭함을 살립니다.' },
    ],
  }
};

const SUBSTITUTE_ITEMS = [
  { id: 'sub-1', name: '양파', kcal: 40, qty: '2개', storage: '상온', date: '2026-06-25', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400' },
  { id: 'sub-2', name: '오이', kcal: 15, qty: '1개', storage: '냉장', date: '2026-06-20', image: 'https://images.unsplash.com/photo-1449339854873-750e6df51303?w=400' },
];

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const recipe = RECIPE_DETAILS_DB[id as string] || RECIPE_DETAILS_DB['default'];
  const [activeImage, setActiveImage] = useState(0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>레시피 상세</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 레시피 썸네일 캐러셀 */}
      <View style={styles.imageSection}>
        <Image source={{ uri: recipe.images[0] }} style={styles.mainImage} />
        <TouchableOpacity style={styles.arrowRightBtn}>
          <Ionicons name="chevron-forward" size={20} color="#333" />
        </TouchableOpacity>
      </View>
      
      {/* 인디케이터 */}
      <View style={styles.indicatorRow}>
        {[0, 1, 2, 3, 4].map(idx => (
          <View key={idx} style={[styles.dot, activeImage === idx && styles.dotActive]} />
        ))}
      </View>

      {/* 영양 정보 섹션 */}
      <View style={styles.contentPadding}>
        <Text style={styles.nutritionTitle}>1인분 기준</Text>
        <View style={styles.nutritionBox}>
          <View style={styles.nutriItem}>
            <Ionicons name="flame-outline" size={28} color={THEME_GREEN} />
            <Text style={styles.nutriValue}>{recipe.nutrition.kcal}</Text>
            <Text style={styles.nutriLabel}>kcal</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.nutriItem}>
            <MaterialCommunityIcons name="leaf" size={26} color={THEME_GREEN} />
            <Text style={styles.nutriValue}>{recipe.nutrition.carbs}g</Text>
            <Text style={styles.nutriLabel}>탄수화물</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.nutriItem}>
            <Ionicons name="barbell-outline" size={28} color={THEME_GREEN} />
            <Text style={styles.nutriValue}>{recipe.nutrition.protein}g</Text>
            <Text style={styles.nutriLabel}>단백질</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.nutriItem}>
            <Ionicons name="water-outline" size={28} color={THEME_GREEN} />
            <Text style={styles.nutriValue}>{recipe.nutrition.fat}g</Text>
            <Text style={styles.nutriLabel}>지방</Text>
          </View>
        </View>

        {/* 타이틀 및 별점 */}
        <View style={styles.titleRow}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4].map(star => <Ionicons key={star} name="star" size={16} color={THEME_GREEN} />)}
            <Ionicons name="star-half" size={16} color={THEME_GREEN} />
            <Text style={styles.ratingScore}>{recipe.rating}</Text>
            <Text style={styles.reviewCount}>리뷰 {recipe.reviews}개</Text>
          </View>
        </View>

        {/* 냉장고 재료 매칭율 */}
        <Text style={styles.matchRateText}>냉장고 재료 {recipe.matchRate}% 활용</Text>
        <View style={styles.ingredientsRow}>
          {recipe.ingredients.map((ing: any, idx: number) => (
            <View key={idx} style={[styles.ingChip, !ing.has && styles.ingChipMissing]}>
              <Text style={[styles.ingChipText, !ing.has && styles.ingChipTextMissing]}>{ing.name}</Text>
            </View>
          ))}
        </View>

        {/* 조리 순서 타임라인 */}
        <Text style={styles.sectionTitle}>조리 순서</Text>
        <View style={styles.stepsContainer}>
          <View style={styles.stepVerticalLine} />
          
          {recipe.steps.map((step: any, index: number) => (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepNumberCircle}>
                <Text style={styles.stepNumberText}>{step.step}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 구분선 */}
      <View style={styles.horizontalDivider} />

      {/* 대체 가능한 식재료 섹션 */}
      <View style={[styles.contentPadding, { paddingBottom: 40 }]}>
        <Text style={styles.substituteTitle}>대체 가능한 식재료</Text>
        <View style={styles.substituteHeaderRow}>
          <Text style={styles.substituteCount}>{SUBSTITUTE_ITEMS.length}개의 재료</Text>
          <View style={styles.filterBtns}>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>정렬</Text>
              <Ionicons name="swap-vertical" size={14} color="#000" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { marginLeft: 8 }]}>
              <Text style={styles.actionBtnText}>필터</Text>
              <Ionicons name="funnel-outline" size={14} color="#000" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={SUBSTITUTE_ITEMS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.subCard}>
              <View style={styles.subImageWrapper}>
                <Image source={{ uri: item.image }} style={styles.subImage} resizeMode="cover" />
              </View>
              <Text style={styles.subCardName}>{item.name}</Text>
              <Text style={styles.subCardInfo}>1인분 기준 | {item.kcal} kcal</Text>
              <Text style={styles.subCardQty}>{item.qty}</Text>
              <Text style={styles.subCardStorage}>{item.storage} 보관</Text>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={12} color="#888" style={{ marginRight: 4 }} />
                <Text style={styles.subCardDate}>소비기한 {item.date}</Text>
              </View>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
  
  imageSection: { marginHorizontal: 20, height: 240, borderRadius: 20, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  mainImage: { width: '100%', height: '100%' },
  arrowRightBtn: { position: 'absolute', right: 15, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center' },
  
  indicatorRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 15, marginBottom: 25 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E0E0E0', marginHorizontal: 4 },
  dotActive: { backgroundColor: '#555' },

  contentPadding: { paddingHorizontal: 20 },
  nutritionTitle: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 15 },
  nutritionBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 25, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  nutriItem: { flex: 1, alignItems: 'center' },
  nutriValue: { fontSize: 16, fontWeight: '800', color: THEME_GREEN, marginTop: 6 },
  nutriLabel: { fontSize: 12, color: THEME_GREEN, fontWeight: '600', marginTop: 2 },
  divider: { width: 1, height: 40, backgroundColor: '#EEE' },

  titleRow: { marginTop: 20, marginBottom: 15 },
  recipeTitle: { fontSize: 24, fontWeight: '900', color: '#111', marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingScore: { fontSize: 15, fontWeight: '700', color: THEME_GREEN, marginLeft: 6 },
  reviewCount: { fontSize: 14, color: '#888', marginLeft: 8, textDecorationLine: 'underline' },

  matchRateText: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 10 },
  ingredientsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 30 },
  ingChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#CCC', marginRight: 8, marginBottom: 8 },
  ingChipText: { fontSize: 13, color: '#555', fontWeight: '600' },
  ingChipMissing: { borderColor: '#FF3B30' },
  ingChipTextMissing: { color: '#FF3B30' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 20 },
  
  stepsContainer: { paddingLeft: 10, position: 'relative', marginBottom: 30 },
  stepVerticalLine: { position: 'absolute', left: 24, top: 10, bottom: 20, width: 1.5, backgroundColor: '#D4E2E1' },
  stepItem: { flexDirection: 'row', marginBottom: 25 },
  stepNumberCircle: { width: 28, height: 28, borderRadius: 8, backgroundColor: THEME_GREEN, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  stepNumberText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  stepContent: { flex: 1, paddingLeft: 16, paddingTop: 2 },
  stepTitle: { fontSize: 16, fontWeight: '800', color: '#222', marginBottom: 6 },
  stepDesc: { fontSize: 14, color: '#777', lineHeight: 22 },

  horizontalDivider: { height: 1, backgroundColor: '#EAEAEA', marginHorizontal: 20, marginBottom: 30 },

  substituteTitle: { fontSize: 22, fontWeight: '900', color: '#111', marginBottom: 15 },
  substituteHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  substituteCount: { fontSize: 18, fontWeight: '800', color: '#111' },
  filterBtns: { flexDirection: 'row' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: '#333' },

  subCard: { width: (SCREEN_WIDTH - 52) / 2, marginRight: 12 },
  subImageWrapper: { width: '100%', height: 120, backgroundColor: '#F5F5F5', borderRadius: 12, overflow: 'hidden', marginBottom: 10 },
  subImage: { width: '100%', height: '100%' },
  subCardName: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 4 },
  subCardInfo: { fontSize: 12, color: '#666', marginBottom: 8 },
  subCardQty: { fontSize: 14, fontWeight: '700', color: '#111' },
  subCardStorage: { fontSize: 12, color: '#999', marginTop: 2, marginBottom: 6 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  subCardDate: { fontSize: 11, color: '#666' }
});