import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAlert } from '@/components/CustomAlert';
import { apiClient } from '@/api/client';
import { InventoryService, IngredientMaster } from '../../services/inventory.service';
import { StorageType, UnitType } from '../../types/inventory';

const STORAGE_OPTIONS: StorageType[] = ['냉장', '냉동', '상온'];
const UNIT_OPTIONS: UnitType[] = ['g', 'kg', 'ml', 'L', '개', '팩'];

const CATEGORY_LIST = [
  '채소',
  '과일',
  '육류',
  '어류',
  '유제품',
  '가공식품',
  '곡류',
  '조미료',
  '기타',
];

const YEARS = [2026, 2027, 2028];
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

export default function ScanScreen() {
  const { showAlert } = useAlert();
  const [scanType, setScanType] = useState<'receipt' | 'fridge'>('receipt');
  const [loading, setLoading] = useState(false);

  // AI 추출 데이터 상태
  const [scannedItems, setScannedItems] = useState<any[] | null>(null);
  const [purchaseDate, setPurchaseDate] = useState<string | null>(null);

  // 개별 식재료 수정 모달 상태
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IngredientMaster[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientMaster | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [editCategory, setEditCategory] = useState('채소');
  const [editQuantity, setEditQuantity] = useState('1');
  const [editUnit, setEditUnit] = useState<UnitType>('개');
  const [editStorage, setEditStorage] = useState<StorageType>('냉장');

  // 유통기한 날짜 선택 전용 상태
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const [selectedYear, setSelectedYear] = useState(today.getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(String(today.getMonth() + 1).padStart(2, '0'));
  const [selectedDay, setSelectedDay] = useState(String(today.getDate()).padStart(2, '0'));
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const editExpiredAt = `${selectedYear}-${selectedMonth}-${selectedDay}`;

  // 1. 촬영 또는 앨범 선택
  const pickImage = async (useCamera: boolean) => {
    try {
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showAlert('권한 필요', '이미지 업로드를 위해 카메라 및 앨범 권한이 필요합니다.', 'warning');
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        if (scanType === 'receipt') {
          sendReceiptToAI(imageUri);
        } else {
          sendFridgeToAI(imageUri);
        }
      }
    } catch (error) {
      console.error('이미지 선택 에러:', error);
      showAlert('오류', '이미지를 불러오는 중 문제가 발생했습니다.', 'warning');
    }
  };

  // 2-1. 영수증 이미지 추출 및 식재료명 정돈 API 연동
  const sendReceiptToAI = async (uri: string) => {
    try {
      setLoading(true);
      const formData = new FormData() as any;
      const filename = uri.split('/').pop() || 'receipt.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('image', {
        uri,
        name: filename,
        type,
      });

      // Step 1: 영수증 이미지 인식 API
      const response = await apiClient.post('/api/v1/ingredients/receipt-recognize/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.success) {
        setPurchaseDate(response.data.purchase_date);
        const rawResults = response.data.results || [];

        // Step 2: 인식된 식재료명을 검증/정돈 API 페이로드로 변환
        const confirmPayload = rawResults.map((item: any) => ({
          ingredient_name: item.ingredient_name || item.display_name || item.name || '식재료',
          quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
          unit: item.unit || '개',
        }));

        // Step 3: 식재료명 정돈 API 호출
        try {
          const validateRes = await apiClient.post('/api/v1/ingredients/validate/', {
            user_confirmed_ingredients: confirmPayload,
          });

          if (
            validateRes.data &&
            validateRes.data.data &&
            Array.isArray(validateRes.data.data.validated_ingredients)
          ) {
            const validatedList = validateRes.data.data.validated_ingredients;

            // Step 4: 정돈된 데이터를 프론트 상태 모델과 병합하여 화면 출력
            const normalizedResults = validatedList.map((valItem: any, index: number) => {
              const originalRaw = rawResults[index] || {};
              return {
                ingredient_id: valItem.ingredient_id || null,
                ingredient_name: valItem.ingredient_name || '식재료',
                category: originalRaw.category || '채소',
                quantity: valItem.quantity ?? 1,
                unit: UNIT_OPTIONS.includes(valItem.unit) ? valItem.unit : '개',
                storage_type: originalRaw.storage_type || '냉장',
                expired_at: originalRaw.expired_at || todayStr,
                registered: valItem.registered ?? false,
              };
            });

            setScannedItems(normalizedResults);
            showAlert(
              '인식 완료',
              validateRes.data.message || '영수증 식재료 인식이 완료되었습니다.',
              'success'
            );
            return;
          }
        } catch (validateErr) {
          console.error('식재료 정돈 API 호출 실패 (기존 인식 데이터 사용):', validateErr);
        }

        // 정돈 API 실패시 Fallback (기존 인식 데이터 사용)
        const normalizedResults = rawResults.map((item: any) => ({
          ingredient_id: item.ingredient_id || null,
          ingredient_name: item.ingredient_name || item.display_name || item.name || '식재료',
          category: item.category || '채소',
          quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
          unit: UNIT_OPTIONS.includes(item.unit) ? item.unit : '개',
          storage_type: item.storage_type || '냉장',
          expired_at: item.expired_at || todayStr,
        }));

        setScannedItems(normalizedResults);
        showAlert('인식 완료', response.data.message || '영수증 인식이 완료되었습니다.', 'success');
      }
    } catch (error: any) {
      console.error('영수증 인식 실패:', error);
      showAlert(
        '인식 실패',
        error?.response?.data?.message || '영수증을 분석하지 못했습니다.',
        'warning'
      );
    } finally {
      setLoading(false);
    }
  };

  // 2-2. 냉장고 사진 추출 API
  const sendFridgeToAI = async (uri: string) => {
    try {
      setLoading(true);
      const formData = new FormData() as any;
      const filename = uri.split('/').pop() || 'fridge.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('image', {
        uri,
        name: filename,
        type,
      });

      const response = await apiClient.post('/api/v1/ingredients/recognize/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.success) {
        setPurchaseDate(null);

        const normalizedResults = (response.data.results || []).map((item: any) => {
          const name = item.display_name || item.ingredient_name || item.name || item.label || '식재료';

          return {
            ingredient_id: item.ingredient_id || null,
            ingredient_name: name,
            category: item.category || '채소',
            quantity: 1,
            unit: '개',
            storage_type: '냉장',
            expired_at: todayStr,
          };
        });

        setScannedItems(normalizedResults);
        showAlert('인식 완료', response.data.message || '냉장고 식재료 인식이 완료되었습니다.', 'success');
      }
    } catch (error: any) {
      console.error('냉장고 인식 실패:', error);
      showAlert(
        '인식 실패',
        error?.response?.data?.message || '냉장고 사진을 분석하지 못했습니다.',
        'warning'
      );
    } finally {
      setLoading(false);
    }
  };

  // 사전 실시간 검색 처리
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
      setEditCategory(item.category);
    }
    if (item.unit && UNIT_OPTIONS.includes(item.unit as UnitType)) {
      setEditUnit(item.unit as UnitType);
    }
    setSearchResults([]);
  };

  // 개별 항목 삭제
  const handleDeleteScannedItem = (index: number) => {
    if (!scannedItems) return;
    setScannedItems((prev) => (prev ? prev.filter((_, i) => i !== index) : null));
  };

  // 개별 항목 수정 모달 오픈
  const openEditModal = (index: number) => {
    if (!scannedItems) return;
    const item = scannedItems[index];
    setEditingIndex(index);
    
    setSearchQuery(item.ingredient_name || '');
    setSelectedIngredient(item.ingredient_id ? { id: item.ingredient_id, name: item.ingredient_name, category: item.category, unit: item.unit, amount: 0 } : null);
    setSearchResults([]);

    setEditCategory(item.category || '채소');
    setEditQuantity(String(item.quantity ?? 1));
    setEditUnit(UNIT_OPTIONS.includes(item.unit) ? item.unit : '개');
    setEditStorage(item.storage_type || '냉장');

    if (item.expired_at) {
      const [y, m, d] = item.expired_at.split('-');
      setSelectedYear(y || String(today.getFullYear()));
      setSelectedMonth(m || String(today.getMonth() + 1).padStart(2, '0'));
      setSelectedDay(d || String(today.getDate()).padStart(2, '0'));
    } else {
      setSelectedYear(String(today.getFullYear()));
      setSelectedMonth(String(today.getMonth() + 1).padStart(2, '0'));
      setSelectedDay(String(today.getDate()).padStart(2, '0'));
    }

    setEditModalVisible(true);
  };

  // 수정 내역 반영
  const handleSaveEditedItem = () => {
    const ingredientName = searchQuery.trim();
    if (!ingredientName) {
      showAlert('알림', '식재료 이름을 입력해주세요.', 'warning');
      return;
    }
    const rawQty = parseFloat(editQuantity);
    if (isNaN(rawQty) || rawQty <= 0) {
      showAlert('알림', '올바른 수량을 입력해주세요.', 'warning');
      return;
    }
    const integerQuantity = Math.max(1, Math.round(rawQty));

    if (editingIndex !== null && scannedItems) {
      const updated = [...scannedItems];
      updated[editingIndex] = {
        ...updated[editingIndex],
        ingredient_id: selectedIngredient ? selectedIngredient.id : null,
        ingredient_name: ingredientName,
        category: editCategory,
        quantity: integerQuantity,
        unit: editUnit,
        storage_type: editStorage,
        expired_at: editExpiredAt,
      };
      setScannedItems(updated);
    }
    setEditModalVisible(false);
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

  // 사용자 냉장고 최종 등록 로직
  const handleConfirmAndRegister = async () => {
    if (!scannedItems || scannedItems.length === 0) {
      showAlert('알림', '등록할 식재료가 없습니다.', 'warning');
      return;
    }

    try {
      setLoading(true);

      for (const item of scannedItems) {
        const ingredientName = (item.ingredient_name || '').trim();
        let targetIngredientId = item.ingredient_id;

        if (!targetIngredientId) {
          const newMasterRes = await InventoryService.createIngredient({
            name: ingredientName || '식재료',
            category: item.category || '채소',
            unit: item.unit || '개',
            amount: 0,
          });
          targetIngredientId = newMasterRes.data.id;
        }

        const rawQty = parseFloat(item.quantity);
        const integerQuantity = Math.max(1, Math.round(isNaN(rawQty) ? 1 : rawQty));

        const payload = {
          ingredient: targetIngredientId,
          quantity: integerQuantity,
          unit: item.unit || '개',
          storage_type: item.storage_type || '냉장',
          expired_at: item.expired_at || todayStr,
        };

        await InventoryService.addRefrigeratorItem(payload as any);
      }

      showAlert('등록 성공', '식재료가 냉장고에 성공적으로 등록되었습니다.', 'success');
      setScannedItems(null);
      setPurchaseDate(null);
    } catch (error: any) {
      console.error('최종 등록 에러 상세:', error?.response?.data);
      let errorMsg = '냉장고 등록 중 문제가 발생했습니다.';
      if (error?.response?.data && typeof error.response.data === 'object') {
        errorMsg = JSON.stringify(error.response.data);
      }
      showAlert('등록 실패', errorMsg, 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 상단 모드 선택 탭 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, scanType === 'receipt' && styles.tabActive]}
          onPress={() => setScanType('receipt')}
        >
          <Ionicons name="receipt-outline" size={18} color={scanType === 'receipt' ? Colors.light.primary : '#666'} />
          <Text style={[styles.tabText, scanType === 'receipt' && styles.tabTextActive]}>영수증 스캔</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, scanType === 'fridge' && styles.tabActive]}
          onPress={() => setScanType('fridge')}
        >
          <Ionicons name="snow-outline" size={18} color={scanType === 'fridge' ? Colors.light.primary : '#666'} />
          <Text style={[styles.tabText, scanType === 'fridge' && styles.tabTextActive]}>냉장고 사진 스캔</Text>
        </TouchableOpacity>
      </View>

      {/* 로딩 상태 */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>식재료를 처리하는 중입니다...</Text>
        </View>
      ) : scannedItems ? (
        <ScrollView style={styles.resultContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.resultHeaderBox}>
            <Text style={styles.resultTitle}>인식된 식재료 검토</Text>
            <Text style={styles.subInfo}>
              구매일: {purchaseDate || '미인식'} | 총 {scannedItems.length}개
            </Text>
            <Text style={styles.guideSubText}>
              오인식된 항목은 터치하여 수정하거나 삭제할 수 있습니다. 확인 후 확정해 주세요.
            </Text>
          </View>

          {scannedItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.itemCard}
              onPress={() => openEditModal(index)}
              activeOpacity={0.8}
            >
              <View style={styles.itemCardRow}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.itemName}>{item.ingredient_name}</Text>
                    {item.category && <Text style={styles.itemCategory}>[{item.category}]</Text>}
                  </View>
                  <Text style={styles.itemDetail}>
                    수량: {item.quantity} {item.unit} | 보관: {item.storage_type || '냉장'}
                  </Text>
                  {item.expired_at && (
                    <Text style={styles.itemExpiry}>예상 유통기한: {item.expired_at}</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteScannedItem(index)}
                  style={styles.deleteIconBtn}
                >
                  <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.primaryButton} onPress={handleConfirmAndRegister}>
            <Text style={styles.primaryButtonText}>냉장고에 최종 확정 등록하기</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => setScannedItems(null)}>
            <Text style={styles.cancelButtonText}>다시 스캔하기</Text>
          </TouchableOpacity>

          {/* 💡 하단 탭바에 버튼이 가려지지 않도록 하단 여백을 120으로 확장 */}
          <View style={{ height: 120 }} />
        </ScrollView>
      ) : (
        <View style={styles.centerBox}>
          <Ionicons name={scanType === 'receipt' ? 'receipt-outline' : 'camera-outline'} size={64} color="#CCC" />
          <Text style={styles.guideText}>
            {scanType === 'receipt'
              ? '구매 영수증을 촬영하거나 앨범에서 선택해\n식재료를 한 번에 불러오세요!'
              : '냉장고 내부 사진을 촬영하거나 업로드하세요.'}
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.actionButton} onPress={() => pickImage(true)}>
              <Ionicons name="camera-outline" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>직접 촬영</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.galleryButton]} onPress={() => pickImage(false)}>
              <Ionicons name="image-outline" size={20} color={Colors.light.primary} />
              <Text style={[styles.actionButtonText, styles.galleryButtonText]}>앨범에서 선택</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 수정 모달 */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>식재료 정보 수정</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
              <Text style={styles.label}>식재료 이름</Text>
              <View style={styles.searchBox}>
                <Ionicons name="create-outline" size={18} color="#888" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="예: 양파, 대파, 후추 등 입력"
                  value={searchQuery}
                  onChangeText={handleSearchIngredient}
                />
                {isSearching && <ActivityIndicator size="small" color={Colors.light.primary} />}
              </View>

              {/* 실시간 사전 검색 드롭다운 */}
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

              <Text style={styles.label}>카테고리 선택</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.pickerRow}>
                  {CATEGORY_LIST.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, editCategory === cat && styles.chipActive]}
                      onPress={() => setEditCategory(cat)}
                    >
                      <Text style={[styles.chipText, editCategory === cat && styles.chipTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.label}>수량 및 단위</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { width: 90, marginBottom: 0, marginRight: 8 }]}
                  keyboardType="numeric"
                  value={editQuantity}
                  onChangeText={setEditQuantity}
                  placeholder="수량"
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                  <View style={styles.pickerRow}>
                    {UNIT_OPTIONS.map((u) => (
                      <TouchableOpacity
                        key={u}
                        style={[styles.chip, editUnit === u && styles.chipActive]}
                        onPress={() => setEditUnit(u)}
                      >
                        <Text style={[styles.chipText, editUnit === u && styles.chipTextActive]}>{u}</Text>
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
                    style={[styles.radioBtn, editStorage === s && styles.radioBtnActive]}
                    onPress={() => setEditStorage(s)}
                  >
                    <Text style={[styles.radioText, editStorage === s && styles.radioTextActive]}>{s}</Text>
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
                  <Text style={styles.dateSelectorText}>{editExpiredAt}</Text>
                </View>
                <Text style={styles.dateChangeBtnText}>날짜 변경</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSaveEditedItem}>
              <Text style={styles.submitBtnText}>수정 완료</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 날짜 선택 서브 모달 */}
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
              <Text style={styles.submitBtnText}>선택 완료 ({editExpiredAt})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 50 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 12, padding: 4, marginBottom: 15 },
  tabButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  tabActive: { backgroundColor: '#FFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  tabText: { fontSize: 13, fontWeight: '600', color: '#666', marginLeft: 6 },
  tabTextActive: { color: Colors.light.primary, fontWeight: '800' },

  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 50 },
  guideText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 16, marginBottom: 30, lineHeight: 20 },
  guideSubText: { fontSize: 12, color: '#888', marginTop: 4 },
  loadingText: { marginTop: 15, fontSize: 14, color: '#444', fontWeight: '600', textAlign: 'center' },

  buttonRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  actionButton: { flex: 1, flexDirection: 'row', backgroundColor: Colors.light.primary, padding: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 },
  galleryButton: { backgroundColor: '#F0F5F5', borderWidth: 1, borderColor: Colors.light.primary },
  actionButtonText: { color: '#FFF', fontWeight: '700', fontSize: 14, marginLeft: 6 },
  galleryButtonText: { color: Colors.light.primary },

  resultContainer: { flex: 1 },
  resultHeaderBox: { marginBottom: 12 },
  resultTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 2 },
  subInfo: { fontSize: 13, color: Colors.light.primary, fontWeight: '700' },

  itemCard: { backgroundColor: '#F9F9F9', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  itemCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 16, fontWeight: '700', color: '#222' },
  itemCategory: { fontSize: 12, color: Colors.light.primary, fontWeight: '700', marginLeft: 6 },
  itemDetail: { fontSize: 13, color: '#555', marginTop: 4 },
  itemExpiry: { fontSize: 11, color: '#888', marginTop: 2 },
  deleteIconBtn: { padding: 8 },

  primaryButton: { backgroundColor: Colors.light.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  primaryButtonText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  cancelButton: { padding: 14, alignItems: 'center', marginTop: 5 },
  cancelButtonText: { color: '#888', fontSize: 13, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, width: '100%', height: '75%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 8 },

  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 12, height: 45 },
  searchInput: { flex: 1, fontSize: 14 },
  searchResultsContainer: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#EEE', borderRadius: 8, marginTop: 4, maxHeight: 150 },
  searchResultItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', flexDirection: 'row', justifyContent: 'space-between' },
  resultName: { fontSize: 14, fontWeight: '700' },
  resultCategory: { fontSize: 12, color: '#888' },
  selectedBadge: { backgroundColor: '#E8F2F1', padding: 10, borderRadius: 8, marginTop: 8 },
  selectedText: { fontSize: 13, color: Colors.light.primary },

  pickerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  chip: { backgroundColor: '#F0F0F0', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginRight: 6 },
  chipActive: { backgroundColor: Colors.light.primary },
  chipText: { fontSize: 13, color: '#666' },
  chipTextActive: { color: '#fff', fontWeight: '700' },

  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  radioBtn: { flex: 1, backgroundColor: '#F5F5F5', padding: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 2 },
  radioBtnActive: { backgroundColor: Colors.light.primary },
  radioText: { fontSize: 13, color: '#666' },
  radioTextActive: { color: '#fff', fontWeight: '700' },

  dateSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', padding: 12, borderRadius: 8, justifyContent: 'space-between' },
  dateSelectorText: { fontSize: 15, fontWeight: '700', color: '#333' },
  dateChangeBtnText: { fontSize: 12, color: Colors.light.primary, fontWeight: '700' },

  pickerLabel: { fontSize: 13, fontWeight: '700', marginTop: 10, marginBottom: 6, color: '#333' },
  pickerChip: { backgroundColor: '#F5F5F5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 6 },
  pickerChipActive: { backgroundColor: Colors.light.primary },
  pickerChipText: { fontSize: 13, color: '#555' },
  pickerChipTextActive: { color: '#FFF', fontWeight: '800' },

  quickDateRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickDateChip: { backgroundColor: '#EFEFEF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15 },
  quickDateText: { fontSize: 12, color: '#555', fontWeight: '600' },

  submitBtn: { backgroundColor: Colors.light.primary, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});