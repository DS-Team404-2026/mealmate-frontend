// 📁 app/(tabs)/cart.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { InventoryService, IngredientMaster } from '../../services/inventory.service';
import { RefrigeratorItem, StorageType, UnitType } from '../../types/inventory';
import { useAlert } from '../../components/CustomAlert';

const STORAGE_OPTIONS: StorageType[] = ['냉장', '냉동', '상온'];
const UNIT_OPTIONS: UnitType[] = ['g', 'kg', 'ml', 'L', '개', '팩'];

const CATEGORY_LIST = [
  { name: '전체', icon: 'grid-outline' },
  { name: '채소', icon: 'leaf-outline' },
  { name: '과일', icon: 'nutrition-outline' },
  { name: '육류', icon: 'restaurant-outline' },
  { name: '어류', icon: 'fish-outline' },
  { name: '유제품', icon: 'ice-cream-outline' },
  { name: '가공식품', icon: 'cube-outline' },
  { name: '곡류', icon: 'basket-outline' },
  { name: '조미료', icon: 'flask-outline' },
  { name: '기타', icon: 'ellipsis-horizontal-circle-outline' },
];

const YEARS = [2026, 2027, 2028];
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

const calculateDDay = (expiredAtStr: string): number => {
  if (!expiredAtStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = expiredAtStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function CartScreen() {
  const { showAlert, showConfirm } = useAlert();

  const [items, setItems] = useState<RefrigeratorItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('전체');

  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<RefrigeratorItem | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IngredientMaster[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientMaster | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedFormCategory, setSelectedFormCategory] = useState<string>('채소');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState<UnitType>('개');
  const [storageType, setStorageType] = useState<StorageType>('냉장');

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [selectedYear, setSelectedYear] = useState(today.getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(String(today.getMonth() + 1).padStart(2, '0'));
  const [selectedDay, setSelectedDay] = useState(String(today.getDate()).padStart(2, '0'));
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const expiredAt = `${selectedYear}-${selectedMonth}-${selectedDay}`;

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await InventoryService.getRefrigerators();
      setItems(response.data);
    } catch (error) {
      console.error('냉장고 데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 💡 탭 이동 후 Cart 화면 진입(포커스)할 때마다 자동 새로고침 수행
  useFocusEffect(
    useCallback(() => {
      fetchInventory();
    }, [])
  );

  const categoryCounts = React.useMemo(() => {
    const counts: { [key: string]: number } = { 전체: items.length };
    items.forEach((item) => {
      const cat = item.ingredient_category || item.category || '기타';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [items]);

  const groupedSections = React.useMemo(() => {
    const filteredItems = items.filter((item) => {
      if (selectedFilterCategory === '전체') return true;
      const cat = item.ingredient_category || item.category || '기타';
      return cat === selectedFilterCategory;
    });

    const groups: { [key: string]: RefrigeratorItem[] } = {};
    filteredItems.forEach((item) => {
      const category = item.ingredient_category || item.category || '기타';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });

    return Object.keys(groups).map((category) => ({
      title: category,
      data: groups[category],
    }));
  }, [items, selectedFilterCategory]);

  const handleSearchIngredient = async (text: string) => {
    setSearchQuery(text);
    setSelectedIngredient(null);

    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const res = await InventoryService.searchIngredients(text.trim());
      setSearchResults(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('재료 검색 실패:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectIngredient = (item: IngredientMaster) => {
    setSelectedIngredient(item);
    setSearchQuery(item.name);
    if (item.category) {
      setSelectedFormCategory(item.category);
    }
    if (item.unit && UNIT_OPTIONS.includes(item.unit as UnitType)) {
      setUnit(item.unit as UnitType);
    }
    setSearchResults([]);
  };

  const openAddModal = () => {
    setEditItem(null);
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (item: RefrigeratorItem) => {
    setEditItem(item);
    setSearchQuery(item.ingredient_name || item.name || '');
    setQuantity(item.quantity !== undefined ? item.quantity.toString() : '1');
    setStorageType(item.storage_type || '냉장');
    setUnit((item.ingredient_unit as UnitType) || item.unit || '개');
    setSelectedFormCategory(item.ingredient_category || item.category || '기타');

    if (item.expired_at) {
      const [y, m, d] = item.expired_at.split('-');
      setSelectedYear(y || String(today.getFullYear()));
      setSelectedMonth(m || String(today.getMonth() + 1).padStart(2, '0'));
      setSelectedDay(d || String(today.getDate()).padStart(2, '0'));
    }
    setModalVisible(true);
  };

  const handleSaveItem = async () => {
    const ingredientName = searchQuery.trim();
    if (!ingredientName) {
      showAlert('알림', '식재료 이름을 입력해 주세요.', 'warning');
      return;
    }

    const numQuantity = parseFloat(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      showAlert('알림', '올바른 수량을 입력해 주세요.', 'warning');
      return;
    }

    if (expiredAt < todayStr) {
      showAlert('등록 차단', '유통기한이 오늘 이전인 날짜는 선택할 수 없습니다.', 'warning');
      return;
    }

    try {
      if (editItem) {
        await InventoryService.updateRefrigeratorItem(editItem.id, {
          quantity: numQuantity,
          storage_type: storageType,
          expired_at: expiredAt,
        });
        showAlert('성공', '식재료 정보가 수정되었습니다.', 'success');
      } else {
        let targetIngredientId = selectedIngredient?.id;

        if (!targetIngredientId) {
          const newMasterRes = await InventoryService.createIngredient({
            name: ingredientName,
            category: selectedFormCategory,
            unit: unit,
            amount: 0,
          });
          targetIngredientId = newMasterRes.data.id;
        }

        const payload: any = {
          ingredient: targetIngredientId,
          quantity: numQuantity,
          storage_type: storageType,
          expired_at: expiredAt,
        };

        await InventoryService.addRefrigeratorItem(payload);
        showAlert('성공', `'${ingredientName}'이(가) 냉장고에 등록되었습니다.`, 'success');
      }

      setModalVisible(false);
      resetForm();
      fetchInventory();
    } catch (error: any) {
      console.error('저장 에러 상세:', error?.response?.data);
      let msg = '처리에 실패했습니다.';
      if (error?.response?.data && typeof error.response.data === 'object') {
        msg = JSON.stringify(error.response.data);
      }
      showAlert('오류 발생', msg, 'warning');
    }
  };

  const handleDeleteItem = (item: RefrigeratorItem) => {
    const itemName = item.ingredient_name || item.name || '해당 식재료';
    showConfirm(
      '식재료 삭제',
      `'${itemName}'을(를) 정말 삭제하시겠습니까?`,
      async () => {
        try {
          await InventoryService.deleteRefrigeratorItem(item.id);
          showAlert('삭제 완료', `'${itemName}'이(가) 삭제되었습니다.`, 'success');
          setModalVisible(false);
          fetchInventory();
        } catch (error) {
          console.error('삭제 실패:', error);
          showAlert('오류', '식재료 삭제에 실패했습니다.', 'warning');
        }
      },
      '삭제',
      '취소'
    );
  };

  const resetForm = () => {
    setEditItem(null);
    setSelectedIngredient(null);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedFormCategory('채소');
    setQuantity('1');
    setUnit('개');
    setStorageType('냉장');
    setSelectedYear(String(today.getFullYear()));
    setSelectedMonth(String(today.getMonth() + 1).padStart(2, '0'));
    setSelectedDay(String(today.getDate()).padStart(2, '0'));
  };

  const addDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setSelectedYear(d.getFullYear().toString());
    setSelectedMonth(String(d.getMonth() + 1).padStart(2, '0'));
    setSelectedDay(String(d.getDate()).padStart(2, '0'));
  };

  const daysInMonth = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
  const DAYS = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>나의 냉장고 관리</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.categoryMenuContainer}>
        <Text style={styles.categoryMenuHeader}>카테고리 선택</Text>
        <View style={styles.categoryGrid}>
          {CATEGORY_LIST.map((cat) => {
            const isSelected = selectedFilterCategory === cat.name;
            const count = categoryCounts[cat.name] || 0;

            return (
              <TouchableOpacity
                key={cat.name}
                style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                onPress={() => setSelectedFilterCategory(cat.name)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={26}
                  color={isSelected ? Colors.light.primary : '#555'}
                />
                <Text style={[styles.categoryCardText, isSelected && styles.categoryCardTextSelected]}>
                  {cat.name}
                </Text>
                {count > 0 && (
                  <View style={[styles.badge, isSelected && styles.badgeSelected]}>
                    <Text style={[styles.badgeText, isSelected && styles.badgeTextSelected]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <SectionList
        sections={groupedSections}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              {selectedFilterCategory === '전체'
                ? '냉장고에 등록된 식재료가 없습니다.'
                : `'${selectedFilterCategory}' 카테고리에 등록된 식재료가 없습니다.`}
            </Text>
          </View>
        }
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag-outline" size={16} color={Colors.light.primary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const dday = calculateDDay(item.expired_at);
          const name = item.ingredient_name || item.name || '식재료';
          const qtyDisplay = item.quantity_display || `${item.quantity ?? 1}${item.ingredient_unit || item.unit || '개'}`;

          return (
            <TouchableOpacity style={styles.itemCard} onPress={() => openEditModal(item)} activeOpacity={0.7}>
              <View style={styles.itemMain}>
                <Text style={styles.itemName}>{name}</Text>
                <TouchableOpacity onPress={() => handleDeleteItem(item)} style={{ marginLeft: 10 }}>
                  <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                </TouchableOpacity>
              </View>

              <View style={styles.itemSub}>
                <Text style={styles.itemQuantity}>{qtyDisplay}</Text>
                <Text style={styles.itemStorage}>{item.storage_type} 보관</Text>
              </View>

              <View style={styles.itemFooter}>
                <Text style={[styles.ddayText, dday <= 3 && styles.warningText]}>
                  {dday < 0
                    ? `기한 만료 (D+${Math.abs(dday)})`
                    : dday === 0
                    ? 'D-Day (오늘까지)'
                    : `D-${dday}`}
                </Text>
                <Text style={styles.expiryText}>소비기한: {item.expired_at}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editItem ? '식재료 정보 수정' : '새 식재료 등록'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
              {!editItem ? (
                <>
                  <Text style={styles.label}>식재료 이름</Text>
                  <View style={styles.searchBox}>
                    <Ionicons name="create-outline" size={18} color="#888" style={{ marginRight: 8 }} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="예: 후추, 소금, 양파 등 입력"
                      value={searchQuery}
                      onChangeText={handleSearchIngredient}
                    />
                    {isSearching && <ActivityIndicator size="small" color={Colors.light.primary} />}
                  </View>

                  {searchResults.length > 0 && (
                    <View style={styles.searchResultsContainer}>
                      {searchResults.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.searchResultItem}
                          onPress={() => handleSelectIngredient(item)}
                        >
                          <Text style={styles.resultName}>{item.name}</Text>
                          <Text style={styles.resultCategory}>{item.category} | 기본: {item.unit}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {selectedIngredient ? (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedText}>사전 연결: <Text style={{ fontWeight: '800' }}>{selectedIngredient.name}</Text> ({selectedIngredient.category})</Text>
                    </View>
                  ) : searchQuery.trim() ? (
                    <View style={[styles.selectedBadge, { backgroundColor: '#FFF4E5' }]}>
                      <Text style={[styles.selectedText, { color: '#E65100' }]}>신규 마스터 자동 생성 등록: <Text style={{ fontWeight: '800' }}>{searchQuery.trim()}</Text></Text>
                    </View>
                  ) : null}
                </>
              ) : (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedText}>수정 중인 재료: <Text style={{ fontWeight: '800' }}>{editItem.ingredient_name || editItem.name}</Text></Text>
                </View>
              )}

              <Text style={styles.label}>카테고리 선택</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.pickerRow}>
                  {CATEGORY_LIST.filter(c => c.name !== '전체').map((cat) => (
                    <TouchableOpacity
                      key={cat.name}
                      style={[styles.chip, selectedFormCategory === cat.name && styles.chipActive]}
                      onPress={() => setSelectedFormCategory(cat.name)}
                    >
                      <Text style={[styles.chipText, selectedFormCategory === cat.name && styles.chipTextActive]}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.label}>수량 및 단위</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { width: 90, marginBottom: 0, marginRight: 8 }]}
                  keyboardType="numeric"
                  placeholder="예: 5"
                  value={quantity}
                  onChangeText={setQuantity}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                  <View style={styles.pickerRow}>
                    {UNIT_OPTIONS.map((u) => (
                      <TouchableOpacity
                        key={u}
                        style={[styles.chip, unit === u && styles.chipActive]}
                        onPress={() => setUnit(u)}
                      >
                        <Text style={[styles.chipText, unit === u && styles.chipTextActive]}>{u}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <Text style={styles.label}>보관 위치</Text>
              <View style={styles.row}>
                {STORAGE_OPTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.radioBtn, storageType === s && styles.radioBtnActive]}
                    onPress={() => setStorageType(s)}
                  >
                    <Text style={[styles.radioText, storageType === s && styles.radioTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>유통기한 설정</Text>
              <TouchableOpacity
                style={styles.dateSelector}
                onPress={() => setDatePickerVisible(true)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="calendar-outline" size={20} color={Colors.light.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.dateSelectorText}>{expiredAt}</Text>
                </View>
                <Text style={styles.dateChangeBtnText}>날짜 선택</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              {editItem && (
                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: '#FF3B30', flex: 1 }]} onPress={() => handleDeleteItem(editItem)}>
                  <Text style={styles.submitBtnText}>삭제하기</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.submitBtn, { flex: 2 }]} onPress={handleSaveItem}>
                <Text style={styles.submitBtnText}>{editItem ? '수정 완료' : '냉장고에 추가하기'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={datePickerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: 'auto', paddingBottom: 25 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>유통기한 날짜 선택</Text>
              <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.pickerLabel}>연도 선택</Text>
            <View style={styles.pickerRow}>
              {YEARS.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={[styles.pickerChip, selectedYear === y.toString() && styles.pickerChipActive]}
                  onPress={() => setSelectedYear(y.toString())}
                >
                  <Text style={[styles.pickerChipText, selectedYear === y.toString() && styles.pickerChipTextActive]}>
                    {y}년
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.pickerLabel}>월 선택</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 4 }}>
              <View style={styles.pickerRow}>
                {MONTHS.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.pickerChip, selectedMonth === m && styles.pickerChipActive]}
                    onPress={() => setSelectedMonth(m)}
                  >
                    <Text style={[styles.pickerChipText, selectedMonth === m && styles.pickerChipTextActive]}>
                      {parseInt(m)}월
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.pickerLabel}>일 선택</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 4 }}>
              <View style={styles.pickerRow}>
                {DAYS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.pickerChip, selectedDay === d && styles.pickerChipActive]}
                    onPress={() => setSelectedDay(d)}
                  >
                    <Text style={[styles.pickerChipText, selectedDay === d && styles.pickerChipTextActive]}>
                      {parseInt(d)}일
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={[styles.pickerLabel, { marginTop: 14 }]}>빠른 날짜 지정</Text>
            <View style={styles.quickDateRow}>
              <TouchableOpacity style={styles.quickDateChip} onPress={() => addDays(3)}>
                <Text style={styles.quickDateText}>+3일</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickDateChip} onPress={() => addDays(7)}>
                <Text style={styles.quickDateText}>+7일(1주)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickDateChip} onPress={() => addDays(14)}>
                <Text style={styles.quickDateText}>+14일(2주)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickDateChip} onPress={() => addDays(30)}>
                <Text style={styles.quickDateText}>+30일(1달)</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { marginTop: 20 }]}
              onPress={() => setDatePickerVisible(false)}
            >
              <Text style={styles.submitBtnText}>선택 완료 ({expiredAt})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  center: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  addBtn: { backgroundColor: Colors.light.primary, padding: 8, borderRadius: 20 },

  categoryMenuContainer: { paddingHorizontal: 16, marginBottom: 10 },
  categoryMenuHeader: { fontSize: 15, fontWeight: '800', color: '#333', marginBottom: 10 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: {
    width: '18%',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#EFEFEF',
    position: 'relative',
  },
  categoryCardSelected: {
    backgroundColor: '#E8F2F1',
    borderColor: Colors.light.primary,
  },
  categoryCardText: { fontSize: 11, color: '#444', fontWeight: '700', marginTop: 4 },
  categoryCardTextSelected: { color: Colors.light.primary, fontWeight: '800' },

  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#888', borderRadius: 9, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  badgeSelected: { backgroundColor: Colors.light.primary },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  badgeTextSelected: { color: '#FFF' },

  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  emptyText: { color: '#888', fontSize: 14, textAlign: 'center' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingVertical: 8, marginTop: 5 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.light.primary },

  itemCard: { backgroundColor: '#F9F9F9', borderRadius: 12, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  itemMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 16, fontWeight: '700' },
  itemSub: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  itemQuantity: { fontSize: 14, color: '#333', fontWeight: '600' },
  itemStorage: { fontSize: 12, color: Colors.light.primary, fontWeight: '600' },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#EAEAEA' },
  ddayText: { fontSize: 13, fontWeight: '800', color: Colors.light.primary },
  warningText: { color: '#FF3B30' },
  expiryText: { fontSize: 12, color: '#888' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, width: '100%', height: '85%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '700', marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 8 },

  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 12, height: 45 },
  searchInput: { flex: 1, fontSize: 14 },
  searchResultsContainer: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#EEE', borderRadius: 8, marginTop: 4, maxHeight: 150 },
  searchResultItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', flexDirection: 'row', justifyContent: 'space-between' },
  resultName: { fontSize: 14, fontWeight: '700' },
  resultCategory: { fontSize: 12, color: '#888' },
  selectedBadge: { backgroundColor: '#E8F2F1', padding: 10, borderRadius: 8, marginTop: 8 },
  selectedText: { fontSize: 13, color: Colors.light.primary },

  row: { flexDirection: 'row', alignItems: 'center' },
  chip: { backgroundColor: '#F0F0F0', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8, marginRight: 6 },
  chipActive: { backgroundColor: Colors.light.primary },
  chipText: { fontSize: 13, color: '#666' },
  chipTextActive: { color: '#fff', fontWeight: '700' },

  radioBtn: { flex: 1, backgroundColor: '#F5F5F5', padding: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 2 },
  radioBtnActive: { backgroundColor: Colors.light.primary },
  radioText: { fontSize: 13, color: '#666' },
  radioTextActive: { color: '#fff', fontWeight: '700' },

  dateSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', padding: 12, borderRadius: 8, justifyContent: 'space-between' },
  dateSelectorText: { fontSize: 15, fontWeight: '700', color: '#333' },
  dateChangeBtnText: { fontSize: 12, color: Colors.light.primary, fontWeight: '700' },

  pickerLabel: { fontSize: 13, fontWeight: '700', marginTop: 10, marginBottom: 6, color: '#333' },
  pickerRow: { flexDirection: 'row', alignItems: 'center' },
  pickerChip: { backgroundColor: '#F5F5F5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 6 },
  pickerChipActive: { backgroundColor: Colors.light.primary },
  pickerChipText: { fontSize: 13, color: '#555' },
  pickerChipTextActive: { color: '#FFF', fontWeight: '800' },

  quickDateRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickDateChip: { backgroundColor: '#EFEFEF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15 },
  quickDateText: { fontSize: 12, color: '#555', fontWeight: '600' },

  submitBtn: { backgroundColor: Colors.light.primary, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});