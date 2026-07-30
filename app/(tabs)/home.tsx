import { Colors } from "@/constants/theme";
import { useIngredientStore } from "@/store/ingredient.store";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 40;

// mock 데이터 
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

export default function HomeScreen() {
  const router = useRouter();
  const { ingredients } = useIngredientStore();
  const [activeMenuIndex, setActiveMenuIndex] = useState(0);

  const displayIngredients = [...ingredients];

  const handleMenuScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollOffset / CARD_WIDTH);
    setActiveMenuIndex(currentIndex);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

      {/* 소비기한 배너 */}
      <View style={styles.banner}>
        <View style={styles.bannerTextContainer}>
          <MaterialCommunityIcons name="clock-outline" size={20} color="#fff" />
          <Text style={styles.bannerText}>소비기한 임박 재료</Text>
        </View>
        <Text style={styles.bannerSubText}>
          식재료를 사용할 수 있는 시간이 23시간 남았습니다!
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
        <Text style={styles.sectionTitle}>나의 식재료</Text>
        <TouchableOpacity
          onPress={() => router.push("/ingredients/categories")}
        >
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

      {/* 재료 리스트 */}
      <FlatList
        data={displayIngredients}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={(SCREEN_WIDTH - 52) / 2 + 12}
        decelerationRate="fast"
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ingredientListContent}
        renderItem={({ item }) => (
          <View style={styles.ingredientCard}>
            <View style={styles.ingredientImagePlaceholder}>
              <Ionicons
                name={
                  item.name.includes("메밀") ||
                  item.name.toLowerCase().includes("soba")
                    ? "fast-food"
                    : item.name.includes("소고기") ||
                        item.name.toLowerCase().includes("beef")
                      ? "nutrition"
                      : "leaf"
                }
                size={36}
                color={Colors.light.primary}
              />
            </View>
            <Text style={styles.ingredientName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.ingredientInfo}>1인분 기준 | 25 kcal</Text>
            <Text style={styles.ingredientStock}>
              {item.quantity} {item.unit}
            </Text>
            <Text style={styles.ingredientLocation}>{item.storage} 보관</Text>

            {/* 날짜 가이드 라인 */}
            <View style={styles.dateContainer}>
              <View style={styles.grayDot} />
              <Text style={styles.ingredientDate}>
                소비기한 {item.expiryDate}
              </Text>
            </View>
          </View>
        )}
      />

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
    justifyContent: "center",
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
  ingredientInfo: { fontSize: 10, color: "#999", marginVertical: 3 },
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
  ingredientDate: { fontSize: 10, color: "#888", fontWeight: "500" },
});
