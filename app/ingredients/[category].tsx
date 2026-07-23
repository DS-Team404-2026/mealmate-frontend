import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, TextInput, Dimensions, Modal, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useIngredientStore, Ingredient } from '@/store/ingredient.store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_WIDTH - 52) / 2;

const STORAGE_OPTIONS: ('냉장' | '냉동' | '상온')[] = ['냉장', '냉동', '상온'];
const UNIT_OPTIONS = ['g', 'kg', 'ml', 'L', '개', '팩'];
const CATEGORY_OPTIONS = ['Vegetables', 'Fruits', 'Dairy & Deli', 'Meat', 'Seafood', 'Grains & Noodles', 'Sauces & Seasoning', 'Frozen Foods', 'Beverages & Alcohol'];

const PLACEHOLDER_IMAGES_MAP: Record<string, string> = {
  'Vegetables': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
  'Fruits': 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400',
  'Dairy & Deli': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400',
  'Meat': 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400',
  'Seafood': 'https://images.unsplash.com/photo-1559740038-0452774d63f5?w=400',
  'Grains & Noodles': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400',
  'Sauces & Seasoning': 'https://images.unsplash.com/photo-1626202157077-d46a81e9f257?w=400',
  'Frozen Foods': 'https://images.unsplash.com/photo-1517093297619-35c596e3b50c?w=400',
  'Beverages & Alcohol': 'https://images.unsplash.com/photo-1621376135061-f3b603348873?w=400',
};

// 상단 헤더 타이틀 노출용 한글 카테고리 매핑
const CATEGORY_NAME_KR: Record<string, string> = {
  'Vegetables': '채소류',
  'Fruits': '과일류',
  'Dairy & Deli': '유제품/델리',
  'Meat': '육류',
  'Seafood': '해산물',
  'Grains & Noodles': '곡물/면류',
  'Sauces & Seasoning': '소스/양념',
  'Frozen Foods': '냉동식품',
  'Beverages & Alcohol': '음료/주류',
};

export default function IngredientListScreen() {
  const { category } = useLocalSearchParams();
  const router = useRouter();
  const { ingredients, addIngredient, updateIngredient, deleteIngredient } = useIngredientStore();

  const filteredIngredients = ingredients.filter(item => item.category === category);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(category as string);
  const [formQuantity, setFormQuantity] = useState('1');
  const [formUnit, setFormUnit] = useState('개');
  const [formStorage, setFormStorage] = useState<'냉장' | '냉동' | '상온'>('냉장');
  const [formExpiry, setFormExpiry] = useState('2026-06-18'); 

  const openAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory(category as string);
    setFormQuantity('1');
    setFormUnit('개');
    setFormStorage('냉장');
    setFormExpiry(new Date().toISOString().split('T')[0]); 
    setModalOpen(true);
  };

  const openEditModal = (item: Ingredient) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormQuantity(item.quantity.toString());
    setFormUnit(item.unit);
    setFormStorage(item.storage);
    setFormExpiry(item.expiryDate);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim()) return;

    const matchedImageUrl = PLACEHOLDER_IMAGES_MAP[formCategory] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

    const payload = {
      name: formName,
      category: formCategory,
      quantity: Number(formQuantity) || 1,
      unit: formUnit,
      storage: formStorage,
      expiryDate: formExpiry,
      image: editingItem 
        ? (editingItem.category === formCategory ? editingItem.image : matchedImageUrl) 
        : matchedImageUrl,
    };

    if (editingItem) {
      updateIngredient(editingItem.id, payload);
    } else {
      addIngredient({
        id: Date.now().toString(),
        ...payload,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteIngredient(id);
    setModalOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="menu-outline" size={28} color="#000" />
        </TouchableOpacity>
        {/* 💡 타이틀 한글화 처리 */}
        <Text style={styles.headerTitle}>{CATEGORY_NAME_KR[category as string] || '나의 식재료'}</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#417D7A" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <Ionicons name="search-outline" size={20} color="#CCC" style={styles.searchIcon} />
        {/* 💡 플레이스홀더 한글화 */}
        <TextInput style={styles.searchInput} placeholder="식재료 검색..." placeholderTextColor="#CCC" />
      </View>

      {/* Filter Header Row */}
      <View style={styles.filterRow}>
        {/* 💡 개수 및 정렬 버튼 한글화 */}
        <Text style={styles.itemCount}>{filteredIngredients.length}개의 재료</Text>
        <View style={styles.filterButtons}>
          <View style={styles.actionButton}><Text style={styles.actionButtonText}>정렬</Text></View>
          <View style={[styles.actionButton, { marginLeft: 8 }]}><Text style={styles.actionButtonText}>필터</Text></View>
        </View>
      </View>

      {/* 식재료 리스트 그리드 */}
      <FlatList
        data={filteredIngredients}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {/* 💡 빈 리스트 안내 문구 한글화 */}
            <Text style={styles.emptyText}>등록된 식재료가 없습니다.{"\n"}우상단 &apos;+&apos; 아이콘을 눌러 등록해 보세요!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openEditModal(item)}>
            <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
            <View style={styles.cardContent}>
              <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardInfo}>{item.quantity} {item.unit}</Text>
              
              <View style={styles.statusRow}>
                <Text style={styles.cardStorage}>{item.storage} 보관</Text>
              </View>

              <View style={styles.dateRow}>
                <View style={styles.grayDot} />
                {/* 💡 날짜 라벨 한글화 */}
                <Text style={styles.cardDate}>소비기한 {item.expiryDate}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* 팝업식 통합 입력/수정 모달 폼 */}
      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingItem ? '식재료 정보 수정' : '새 식재료 등록'}</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>식재료명</Text>
              <TextInput style={styles.input} value={formName} onChangeText={setFormName} placeholder="예: 양파, 사과, 소고기" />

              <Text style={styles.label}>카테고리</Text>
              <View style={styles.optionsGrid}>
                {CATEGORY_OPTIONS.map((cat) => (
                  <TouchableOpacity key={cat} style={[styles.optionChip, formCategory === cat && styles.optionChipActive]} onPress={() => setFormCategory(cat)}>
                    <Text style={[styles.optionChipText, formCategory === cat && styles.optionChipTextActive]}>{CATEGORY_NAME_KR[cat] || cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>수량 및 단위</Text>
              <View style={styles.qtyRow}>
                <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} keyboardType="numeric" value={formQuantity} onChangeText={setFormQuantity} />
                <View style={styles.unitContainer}>
                  {UNIT_OPTIONS.map((unit) => (
                    <TouchableOpacity key={unit} style={[styles.unitChip, formUnit === unit && styles.unitChipActive]} onPress={() => setFormUnit(unit)}>
                      <Text style={[styles.unitChipText, formUnit === unit && styles.unitChipTextActive]}>{unit}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Text style={styles.label}>보관 위치</Text>
              <View style={styles.rowContainer}>
                {STORAGE_OPTIONS.map((store) => (
                  <TouchableOpacity key={store} style={[styles.radioCell, formStorage === store && styles.radioCellActive]} onPress={() => setFormStorage(store)}>
                    <Text style={[styles.radioText, formStorage === store && styles.radioTextActive]}>{store}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>소비기한 (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} value={formExpiry} onChangeText={setFormExpiry} placeholder="YYYY-MM-DD" maxLength={10} />
            </ScrollView>

            <View style={styles.modalFooter}>
              {editingItem && (
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(editingItem.id)}>
                  <Text style={styles.deleteButtonText}>삭제</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{editingItem ? '변경사항 저장' : '등록하기'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111' },
  addButton: { width: 40, height: 40, backgroundColor: '#F0F7F6', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  
  searchSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 20, borderRadius: 12, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: '#EEE' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },

  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginVertical: 20 },
  itemCount: { fontSize: 18, fontWeight: '800', color: '#000' },
  filterButtons: { flexDirection: 'row' },
  actionButton: { backgroundColor: '#F5F5F5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  actionButtonText: { fontSize: 14, fontWeight: '600' },

  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  row: { justifyContent: 'space-between' },
  card: { backgroundColor: '#fff', width: COLUMN_WIDTH, borderRadius: 15, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#F0F0F0' },
  cardImage: { width: '100%', height: 120, backgroundColor: '#F9F9F9' },
  cardContent: { padding: 12 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#000' },
  cardInfo: { fontSize: 12, color: '#666', marginTop: 4, fontWeight: '500' },
  statusRow: { marginTop: 6 },
  cardStorage: { fontSize: 11, color: '#417D7A', backgroundColor: '#E8F2F1', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: '600' },
  
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  grayDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#A0A0A0', marginRight: 6 },
  cardDate: { fontSize: 11, color: '#888', fontWeight: '500' },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { textAlign: 'center', color: '#999', lineHeight: 22, fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, height: '85%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  modalForm: { flex: 1, marginTop: 15 },
  label: { fontSize: 14, fontWeight: '700', color: '#333', marginTop: 15, marginBottom: 8 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 5 },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  unitContainer: { flexDirection: 'row', flexWrap: 'wrap', flex: 2, marginLeft: 10 },
  unitChip: { backgroundColor: '#F5F5F5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, margin: 2 },
  unitChipActive: { backgroundColor: '#417D7A' },
  unitChipText: { fontSize: 12, color: '#666' },
  unitChipTextActive: { color: '#fff', fontWeight: '700' },
  rowContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  radioCell: { flex: 1, backgroundColor: '#F5F5F5', padding: 12, borderRadius: 10, alignItems: 'center', marginHorizontal: 4 },
  radioCellActive: { backgroundColor: '#417D7A' },
  radioText: { fontSize: 14, color: '#666', fontWeight: '600' },
  radioTextActive: { color: '#fff' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  optionChip: { backgroundColor: '#F5F5F5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15, margin: 4 },
  optionChipActive: { backgroundColor: '#E8F2F1', borderWidth: 1, borderColor: '#417D7A' },
  optionChipText: { fontSize: 12, color: '#666' },
  optionChipTextActive: { color: '#417D7A', fontWeight: '700' },
  modalFooter: { flexDirection: 'row', marginTop: 15, paddingBottom: 20 },
  deleteButton: { flex: 1, backgroundColor: '#FFEDED', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10, height: 50 },
  deleteButtonText: { color: '#FF3B30', fontWeight: '700', fontSize: 16 },
  saveButton: { flex: 3, backgroundColor: '#417D7A', borderRadius: 12, justifyContent: 'center', alignItems: 'center', height: 50 },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});