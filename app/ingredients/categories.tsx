import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from "@/constants/theme";

// 오리지널 테마 색상 정의
const TEXT_PURPLE_BROWN = '#4A3B53';

// 내부 라우팅 명칭(name)은 원본을 유지하디, 화면 표시용 이름(displayName)을 한국어로 안전하게 추가
const CATEGORIES = [
  { id: '1', name: 'Vegetables', displayName: '채소류', type: 'ionicons', icon: 'leaf-outline' },
  { id: '2', name: 'Fruits', displayName: '과일류', type: 'material', icon: 'food-apple-outline' },
  { id: '3', name: 'Dairy & Deli', displayName: '유제품/델리', type: 'material', icon: 'cheese' },
  { id: '4', name: 'Meat', displayName: '육류', type: 'material', icon: 'food-steak' }, 
  { id: '5', name: 'Seafood', displayName: '해산물', type: 'material', icon: 'fish' },
  { id: '6', name: 'Grains & Noodles', displayName: '곡물/면류', type: 'material', icon: 'food-variant' },
  { id: '7', name: 'Sauces & Seasoning', displayName: '소스/양념', type: 'fa6', icon: 'jar' },
  { id: '8', name: 'Frozen Foods', displayName: '냉동식품', type: 'material', icon: 'snowflake' },
  { id: '9', name: 'Beverages & Alcohol', displayName: '음료/주류', type: 'material', icon: 'glass-wine' },
];

export default function CategoryScreen() {
  const router = useRouter();

  // 아이콘 팩의 종류에 따라 컴포넌트를 분기 처리하는 헬퍼 함수
  const renderIcon = (type: string, iconName: string) => {
    if (type === 'ionicons') {
      return <Ionicons name={iconName as any} size={44} color={Colors.light.primary} />;
    }
    if (type === 'fa6') {
      return <FontAwesome6 name={iconName as any} size={40} color={Colors.light.primary} />;
    }
    return <MaterialCommunityIcons name={iconName as any} size={48} color={Colors.light.primary} />;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="menu-outline" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>나의 식재료</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Product Search */}
      <View style={styles.searchSection}>
        <Ionicons name="search-outline" size={20} color="#BBB" style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="식재료 검색..." placeholderTextColor="#BBB" />
        <Ionicons name="mic-outline" size={20} color="#BBB" />
      </View>

      {/* Category Title Header */}
      <View style={styles.categoryTitleRow}>
        <Text style={styles.categoryTitle}>카테고리</Text>
        <TouchableOpacity><Text style={styles.seeAllText}>전체 보기</Text></TouchableOpacity>
      </View>

      {/* 2번째 사진 레이아웃과 동일한 미니멀 그리드 배치 */}
      <FlatList
        data={CATEGORIES}
        numColumns={3}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.categoryItem}
            onPress={() => router.push({ pathname: '/ingredients/[category]', params: { category: item.name } })}
          >
            <View style={styles.iconContainer}>
              {renderIcon(item.type, item.icon)}
            </View>
            <Text style={styles.categoryName}>{item.displayName}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111', textAlign: 'center', flex: 1 },
  
  searchSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 20, marginVertical: 20, borderRadius: 12, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: '#EEE' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  
  categoryTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 30 },
  categoryTitle: { fontSize: 22, fontWeight: '800', color: '#111' },
  seeAllText: { color: '#999', fontSize: 14, fontWeight: '500' },
  
  listContent: { paddingHorizontal: 10 },
  row: { justifyContent: 'space-between', marginBottom: 35 },
  categoryItem: { flex: 1, alignItems: 'center', maxWidth: '33.3%' },
  
  iconContainer: { 
    width: 70, 
    height: 70, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 10,
  },
  categoryName: { fontSize: 12, color: TEXT_PURPLE_BROWN, fontWeight: '500', textAlign: 'center' },
});