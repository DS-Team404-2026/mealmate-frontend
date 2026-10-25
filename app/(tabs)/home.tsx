import { Colors } from "@/constants/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { InventoryService } from "../../services/inventory.service";
import { RefrigeratorItem } from "../../types/inventory";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 40;

// 추천 메뉴 MOCK 데이터
const TODAY_RECOMMENDATIONS = [
  {
    id: "rec-1",
    title: "새우 냉국수",
    kcal: "1인분 기준 : 400 kcal",
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "rec-2",
    title: "아보카도 샐러드",
    kcal: "1인분 기준 : 280 kcal",
    image:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "rec-3",
    title: "토마토 파스타",
    kcal: "1인분 기준 : 520 kcal",
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80",
  },
];

// 실시간 D-Day 계산 함수
const calculateDDay = (expiredAtStr: string): number => {
  if (!expiredAtStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = expiredAtStr.split("-").map(Number);
  const targetDate = new Date(year, month - 1, day);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function HomeScreen() {
  const router = useRouter();
  const [activeMenuIndex, setActiveMenuIndex] = useState(0);

  // 실데이터 및 로딩 상태 관리
  const [ingredients, setIngredients] = useState<RefrigeratorItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 백엔드 실데이터 조회 및 소비기한(유통기한) 오름차순 정렬
  const fetchMyIngredients = async () => {
    try {
      setLoading(true);
      const res = await InventoryService.getRefrigerators();
      
      const sorted = res.data.sort((a, b) => {
        const dateA = new Date(a.expired_at).getTime();
        const dateB = new Date(b.expired_at).getTime();
        return dateA - dateB;
      });

      setIngredients(sorted);
    } catch (err) {
      console.error("홈 화면 식재료 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyIngredients();
    }, [])
  );

  const handleMenuScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollOffset / CARD_WIDTH);
    setActiveMenuIndex(currentIndex);
  };

  const mostUrgentItem = ingredients.length > 0 ? ingredients[0] : null;
  const urgentDDay = mostUrgentItem ? calculateDDay(mostUrgentItem.expired_at) : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="menu-outline" size={28} color="#000" />
        <Image
          source={require("@/assets/images/splash-icon.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <View style={{ width: 28 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="레시피 검색..."
          placeholderTextColor="#999"
        />
        <Ionicons name="mic-outline" size={20} color="#999" />
      </View>

      {/* 소비기한 임박 배너 */}
      <View style={styles.banner}>
        <View style={styles.bannerTextContainer}>
          <MaterialCommunityIcons name="clock-outline" size={20} color="#fff" />
          <Text style={styles.bannerText}>소비기한 임박 재료</Text>
        </View>
        <Text style={styles.bannerSubText}>
          {mostUrgentItem
            ? `'${mostUrgentItem.ingredient_name || mostUrgentItem.name}'의 소비기한이 ${
                urgentDDay! < 0
                  ? `지났습니다 (D+${Math.abs(urgentDDay!)})`
                  : urgentDDay === 0
                  ? "오늘까지입니다!"
                  : `${urgentDDay}일 남았습니다!`
              }`
            : "냉장고에 등록된 식재료가 없습니다."}
        </Text>

        <TouchableOpacity
          style={styles.bannerButton}
          onPress={() => router.push("/ingredients/expiry-alerts")}
        >
          <Text style={styles.bannerButtonText}>전체 보기 →</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Menu Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>오늘의 추천 메뉴</Text>
        <TouchableOpacity>
          <View style={styles.seeAllButtonContainer}>
            <Text style={styles.seeAllText}>전체 보기</Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color="#999"
              style={{ marginLeft: 2 }}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* 오늘의 메뉴 슬라이더 */}
      <View>
        <FlatList
          data={TODAY_RECOMMENDATIONS}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 20}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 20 }}
          keyExtractor={(item) => item.id}
          onScroll={handleMenuScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <View style={[styles.heroCard, { width: CARD_WIDTH }]}>
              <Image source={{ uri: item.image }} style={styles.heroImage} />
              <View style={styles.heroOverlay}>
                <Text style={styles.heroTitle}>{item.title}</Text>
                <Text style={styles.heroSubTitle}>{item.kcal}</Text>
                <TouchableOpacity style={styles.recipeButton}>
                  <Text style={styles.recipeButtonText}>레시피 보기 →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        {/* 인디케이터 점 표시 */}
        <View style={styles.indicatorContainer}>
          {TODAY_RECOMMENDATIONS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicatorDot,
                activeMenuIndex === index && styles.indicatorDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* My Ingredients Section */}
      <View style={styles.sectionHeader}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/cart")}>
          <Text style={styles.sectionTitle}>나의 식재료</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(tabs)/cart")}>
          <View style={styles.seeAllButtonContainer}>
            <Text style={styles.seeAllText}>전체 보기</Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color="#999"
              style={{ marginLeft: 2 }}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* 식재료 리스트 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.light.primary} />
        </View>
      ) : (
        <FlatList
          data={ingredients}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={(SCREEN_WIDTH - 52) / 2 + 12}
          decelerationRate="fast"
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.ingredientListContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>냉장고가 비어있습니다.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const dday = calculateDDay(item.expired_at);
            const itemName = item.ingredient_name || item.name || "식재료";
            const category = item.ingredient_category || item.category || "기타";
            const qtyDisplay = item.quantity_display || `${item.quantity ?? 1}${item.ingredient_unit || item.unit || "개"}`;

            return (
              <TouchableOpacity
                style={styles.ingredientCard}
                onPress={() => router.push("/(tabs)/cart")}
                activeOpacity={0.7}
              >
                <View style={styles.ingredientImagePlaceholder}>
                  <Ionicons
                    name={
                      category === "채소"
                        ? "leaf-outline"
                        : category === "과일"
                        ? "nutrition-outline"
                        : category === "육류"
                        ? "restaurant-outline"
                        : category === "어류"
                        ? "fish-outline"
                        : category === "유제품"
                        ? "ice-cream-outline"
                        : "cube-outline"
                    }
                    size={36}
                    color={Colors.light.primary}
                  />
                </View>
                <Text style={styles.ingredientName} numberOfLines={1}>
                  {itemName}
                </Text>
                <Text style={styles.ingredientInfo}>{category}</Text>
                <Text style={styles.ingredientStock}>{qtyDisplay}</Text>
                <Text style={styles.ingredientLocation}>{item.storage_type} 보관</Text>

                <View style={styles.dateContainer}>
                  <View
                    style={[
                      styles.grayDot,
                      dday <= 3 && { backgroundColor: "#FF3B30" },
                    ]}
                  />
                  <Text
                    style={[
                      styles.ingredientDate,
                      dday <= 3 && { color: "#FF3B30", fontWeight: "700" },
                    ]}
                  >
                    {dday < 0
                      ? `만료 (D+${Math.abs(dday)})`
                      : dday === 0
                      ? "D-Day (오늘)"
                      : `D-${dday}`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <View style={{ height: 140 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  logoImage: { width: 100, height: 35 },

  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    margin: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  banner: {
    backgroundColor: "#5A8D8A",
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 15,
  },
  bannerTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  bannerText: { color: "#fff", fontSize: 16, fontWeight: "700", marginLeft: 5 },
  bannerSubText: { color: "#E0E0E0", fontSize: 12, marginBottom: 10 },
  bannerButton: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  bannerButtonText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  seeAllButtonContainer: { flexDirection: "row", alignItems: "center" },
  seeAllText: { color: "#999", fontSize: 14, fontWeight: "500" },

  heroCard: {
    borderRadius: 20,
    overflow: "hidden",
    height: 220,
    marginRight: 20,
  },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 20,
    justifyContent: "center", // 👈 수정 완료 (justify -> justifyContent)
  },
  heroTitle: { color: "#fff", fontSize: 24, fontWeight: "900" },
  heroSubTitle: { color: "#ddd", fontSize: 13, marginTop: 5, marginBottom: 15 },
  recipeButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  recipeButtonText: { color: "#fff", fontWeight: "700" },

  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
  },
  indicatorDotActive: { backgroundColor: "#417D7A", width: 14 },

  loadingContainer: { paddingVertical: 30, alignItems: "center" },
  emptyContainer: { paddingHorizontal: 20, paddingVertical: 20 },
  emptyText: { color: "#999", fontSize: 13 },

  ingredientListContent: { paddingHorizontal: 20, paddingBottom: 20 },
  ingredientCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: "#F9F9F9",
    borderRadius: 15,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  ingredientImagePlaceholder: {
    width: "100%",
    height: 90,
    backgroundColor: "#fff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  ingredientName: { fontSize: 14, fontWeight: "700" },
  ingredientInfo: { fontSize: 11, color: "#999", marginVertical: 3 },
  ingredientStock: { fontSize: 12, fontWeight: "700", color: "#333" },
  ingredientLocation: { fontSize: 11, color: "#666" },

  dateContainer: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  grayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#A0A0A0",
    marginRight: 5,
  },
  ingredientDate: { fontSize: 11, color: "#888", fontWeight: "500" },
});