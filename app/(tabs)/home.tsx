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
import { RecipeService } from "../../services/recipe.service";
import { RefrigeratorItem } from "../../types/inventory";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 40;
const INGREDIENT_CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.68);
const INGREDIENT_CARD_GAP = 12;

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

  // 식재료 및 레시피 상태
  const [ingredients, setIngredients] = useState<RefrigeratorItem[]>([]);
  const [allSavedRecipes, setAllSavedRecipes] = useState<any[]>([]); // 저장된 전체 레시피 (검색 대상)
  const [recommendedRecipes, setRecommendedRecipes] = useState<any[]>([]); // 고정 추천 레시피 (랜덤 3개)
  const [searchQuery, setSearchQuery] = useState(""); // 실시간 검색어
  const [loading, setLoading] = useState(true);

  const fetchHomeData = async () => {
    try {
      setLoading(true);

      const [refrigRes, savedRes] = await Promise.allSettled([
        InventoryService.getRefrigerators(),
        RecipeService.getSavedRecipes(),
      ]);

      if (refrigRes.status === "fulfilled" && refrigRes.value?.data) {
        const sorted = refrigRes.value.data.sort((a, b) => {
          const dateA = new Date(a.expired_at).getTime();
          const dateB = new Date(b.expired_at).getTime();
          return dateA - dateB;
        });
        setIngredients(sorted);
      }

      if (
        savedRes.status === "fulfilled" &&
        savedRes.value?.data?.bookmarks
      ) {
        const bookmarks = savedRes.value.data.bookmarks;
        setAllSavedRecipes(bookmarks);

        // 오늘의 추천 메뉴용 랜덤 3개 고정
        const shuffled = [...bookmarks].sort(() => 0.5 - Math.random());
        setRecommendedRecipes(shuffled.slice(0, 3));
      }
    } catch (err) {
      console.error("홈 화면 데이터 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [])
  );

  const handleMenuScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollOffset / CARD_WIDTH);
    setActiveMenuIndex(currentIndex);
  };

  // 실시간 검색어 기반 필터링 (드롭다운 연관 검색어용)
  const searchResults = searchQuery.trim()
    ? allSavedRecipes.filter((item) =>
        (item.title || "")
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase())
      )
    : [];

  const mostUrgentItem = ingredients.length > 0 ? ingredients[0] : null;
  const urgentDDay = mostUrgentItem ? calculateDDay(mostUrgentItem.expired_at) : null;

  const ingredientColumns: RefrigeratorItem[][] = [];
  for (let i = 0; i < ingredients.length; i += 2) {
    ingredientColumns.push(ingredients.slice(i, i + 2));
  }

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

      {/* Search Bar + 드롭다운 연관 검색 리스트 패널 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchSection}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="저장된 레시피 검색..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : (
            <Ionicons name="mic-outline" size={20} color="#999" />
          )}
        </View>

        {/* 연관 단어/레시피 검색 드롭다운 */}
        {searchQuery.trim().length > 0 && (
          <View style={styles.searchDropdown}>
            {searchResults.length > 0 ? (
              searchResults.map((recipe, index) => (
                <TouchableOpacity
                  key={recipe.recipe_id || index}
                  style={[
                    styles.searchDropdownItem,
                    index === searchResults.length - 1 && styles.lastDropdownItem,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSearchQuery("");
                    router.push({
                      pathname: "/recipes/[id]",
                      params: { id: recipe.recipe_id },
                    });
                  }}
                >
                  <View style={styles.searchDropdownLeft}>
                    <Ionicons
                      name="restaurant-outline"
                      size={16}
                      color={Colors.light.primary}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.searchDropdownText} numberOfLines={1}>
                      {recipe.title}
                    </Text>
                  </View>
                  <Text style={styles.searchDropdownMeta}>
                    {recipe.cooking_time ? `${recipe.cooking_time}분` : ""}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptySearchItem}>
                <Text style={styles.emptySearchText}>
                  검색어와 일치하는 저장된 레시피가 없습니다.
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* 소비기한 임박 배너 */}
      <View style={styles.banner}>
        <Ionicons
          name="timer-outline"
          size={110}
          color="rgba(255, 255, 255, 0.08)"
          style={styles.bannerBgIcon}
        />
        <View style={styles.bannerTextContainer}>
          <MaterialCommunityIcons name="clock-outline" size={18} color="#fff" />
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
          activeOpacity={0.8}
        >
          <Text style={styles.bannerButtonText}>전체 보기 →</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Menu Section (고정 렌더링) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>오늘의 추천 메뉴</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/recipes")}>
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
        {recommendedRecipes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="bookmark-outline" size={32} color="#8A9399" />
            <Text style={styles.emptyCardText}>
              저장된 레시피가 없습니다.
            </Text>
            <TouchableOpacity
              style={styles.emptyCardBtn}
              onPress={() => router.push("/(tabs)/recipes")}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyCardBtnText}>레시피 추천 받으러 가기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={recommendedRecipes}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + 20}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 20 }}
              keyExtractor={(item, index) => (item.recipe_id || index).toString()}
              onScroll={handleMenuScroll}
              scrollEventThrottle={16}
              renderItem={({ item }) => (
                <View style={[styles.heroCard, { width: CARD_WIDTH }]}>
                  <View style={styles.heroBackground}>
                    <Ionicons
                      name="restaurant-outline"
                      size={120}
                      color="rgba(255,255,255,0.08)"
                      style={styles.heroBgIcon}
                    />
                    <View style={styles.heroBadgeRow}>
                      <View style={styles.heroBadge}>
                        <Ionicons name="time-outline" size={13} color="#FFF" />
                        <Text style={styles.heroBadgeText}>{item.cooking_time}분</Text>
                      </View>
                      <View style={styles.heroBadge}>
                        <Ionicons name="speedometer-outline" size={13} color="#FFF" />
                        <Text style={styles.heroBadgeText}>난이도 {item.difficulty}</Text>
                      </View>
                      {item.preference && (
                        <View style={[styles.heroBadge, { backgroundColor: "rgba(255,255,255,0.3)" }]}>
                          <Text style={styles.heroBadgeText}>선호도: {item.preference}</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.heroTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.heroSubTitle}>
                      내가 저장한 레시피북 추천 메뉴
                    </Text>

                    <TouchableOpacity
                      style={styles.recipeButton}
                      activeOpacity={0.8}
                      onPress={() =>
                        router.push({
                          pathname: "/recipes/[id]",
                          params: { id: item.recipe_id },
                        })
                      }
                    >
                      <Text style={styles.recipeButtonText}>레시피 보기 →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />

            <View style={styles.indicatorContainer}>
              {recommendedRecipes.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicatorDot,
                    activeMenuIndex === index && styles.indicatorDotActive,
                  ]}
                />
              ))}
            </View>
          </>
        )}
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

      {/* 식재료 리스트 (2행 가로 스크롤) */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.light.primary} />
        </View>
      ) : ingredients.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="basket-outline" size={32} color="#8A9399" />
          <Text style={styles.emptyCardText}>
            냉장고에 등록된 식재료가 없습니다.
          </Text>
          <TouchableOpacity
            style={styles.emptyCardBtn}
            onPress={() => router.push("/(tabs)/scan")}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyCardBtnText}>식재료 등록하러 가기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={ingredientColumns}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={INGREDIENT_CARD_WIDTH + INGREDIENT_CARD_GAP}
          decelerationRate="fast"
          keyExtractor={(column) => column.map((it) => it.id).join("-")}
          contentContainerStyle={styles.ingredientListContent}
          renderItem={({ item: column }) => (
            <View style={styles.ingredientColumn}>
              {column.map((item, rowIndex) => {
                const dday = calculateDDay(item.expired_at);
                const itemName = item.ingredient_name || item.name || "식재료";
                const category = item.ingredient_category || item.category || "기타";
                const qtyDisplay = item.quantity_display || `${item.quantity ?? 1}${item.ingredient_unit || item.unit || "개"}`;

                return (
                  <TouchableOpacity
                    key={item.id.toString()}
                    style={[
                      styles.ingredientCard,
                      rowIndex > 0 && styles.ingredientCardSecondRow,
                    ]}
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
                        size={28}
                        color={Colors.light.primary}
                      />
                    </View>

                    <View style={styles.ingredientBody}>
                      <Text style={styles.ingredientName} numberOfLines={1}>
                        {itemName}
                      </Text>

                      <View style={styles.ingredientMetaRow}>
                        <Text style={styles.ingredientInfo}>{category}</Text>
                        <Text style={styles.ingredientMetaDivider}>·</Text>
                        <Text style={styles.ingredientStock}>{qtyDisplay}</Text>
                      </View>

                      <View style={styles.ingredientFooter}>
                        <Text style={styles.ingredientLocation} numberOfLines={1}>
                          {item.storage_type} 보관
                        </Text>

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
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
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

  // 검색 영역 컨테이너
  searchContainer: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
    zIndex: 10,
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },

  // 연관 검색어 드롭다운 패널 스타일
  searchDropdown: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#EEF0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 220,
  },
  searchDropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F6F6",
  },
  lastDropdownItem: {
    borderBottomWidth: 0,
  },
  searchDropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  searchDropdownText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
    flexShrink: 1,
  },
  searchDropdownMeta: {
    fontSize: 12,
    color: "#8A9399",
    marginLeft: 8,
    fontWeight: "500",
  },
  emptySearchItem: {
    padding: 16,
    alignItems: "center",
  },
  emptySearchText: {
    fontSize: 13,
    color: "#8A9399",
  },

  banner: {
    backgroundColor: "#356764",
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 18,
    position: "relative",
    overflow: "hidden",
  },
  bannerBgIcon: {
    position: "absolute",
    right: -10,
    bottom: -15,
  },
  bannerTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  bannerText: { color: "#fff", fontSize: 15, fontWeight: "800", marginLeft: 6 },
  bannerSubText: { color: "#E0F2F1", fontSize: 12, marginBottom: 12, lineHeight: 18, fontWeight: "500" },
  bannerButton: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bannerButtonText: { color: "#FFF", fontSize: 12, fontWeight: "700" },

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
    height: 200,
    marginRight: 20,
  },
  heroBackground: {
    flex: 1,
    backgroundColor: "#417D7A",
    padding: 20,
    justifyContent: "center",
    position: "relative",
  },
  heroBgIcon: {
    position: "absolute",
    right: -10,
    bottom: -20,
  },
  heroBadgeRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  heroBadgeText: { color: "#FFF", fontSize: 11, fontWeight: "600" },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "900" },
  heroSubTitle: { color: "#E0F2F1", fontSize: 13, marginTop: 4, marginBottom: 16 },
  recipeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  recipeButtonText: { color: "#fff", fontWeight: "800", fontSize: 13 },

  emptyCard: {
    marginHorizontal: 20,
    height: 160,
    backgroundColor: "#F9F9F9",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EEE",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyCardText: { color: "#666", fontSize: 14, marginTop: 8, fontWeight: "600" },
  emptyCardBtn: {
    marginTop: 12,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptyCardBtnText: { color: "#FFF", fontSize: 12, fontWeight: "800" },

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

  ingredientListContent: { paddingHorizontal: 20, paddingBottom: 20 },
  ingredientColumn: {
    width: INGREDIENT_CARD_WIDTH,
    marginRight: INGREDIENT_CARD_GAP,
  },
  ingredientCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  ingredientCardSecondRow: { marginTop: 10 },
  ingredientImagePlaceholder: {
    width: 56,
    height: 56,
    backgroundColor: "#fff",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  ingredientBody: { flex: 1 },
  ingredientName: { fontSize: 15, fontWeight: "700" },
  ingredientMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  ingredientInfo: { fontSize: 11, color: "#999" },
  ingredientMetaDivider: { fontSize: 11, color: "#CCC", marginHorizontal: 5 },
  ingredientStock: { fontSize: 12, fontWeight: "700", color: "#333" },
  ingredientFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  ingredientLocation: { fontSize: 11, color: "#666", flexShrink: 1 },

  dateContainer: { flexDirection: "row", alignItems: "center" },
  grayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#A0A0A0",
    marginRight: 5,
  },
  ingredientDate: { fontSize: 11, color: "#888", fontWeight: "500" },
});