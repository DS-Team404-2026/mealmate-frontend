import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
import { InventoryService } from '../../services/inventory.service';
import { RefrigeratorItem } from '../../types/inventory';
import { useAlert } from '../../components/CustomAlert';

const ALERT_OPTIONS = ['당일', '1일 전', '3일 전'];
const STORAGE_KEY = '@expiry_alert_option';

// 실시간 날짜 기준 D-Day 계산 함수
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

export default function ExpiryAlertsScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [ingredients, setIngredients] = useState<RefrigeratorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertDaysOption, setAlertDaysOption] = useState('3일 전');

  // 1. 초기 데이터 및 저장된 알림 설정값 로드
  const fetchInitialData = async () => {
    try {
      setLoading(true);

      // 기기에 저장된 알림 옵션 불러오기
      const savedOption = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedOption && ALERT_OPTIONS.includes(savedOption)) {
        setAlertDaysOption(savedOption);
      }

      // 백엔드 냉장고 식재료 데이터 조회
      const res = await InventoryService.getRefrigerators();
      const sorted = res.data.sort((a, b) => {
        const dateA = new Date(a.expired_at).getTime();
        const dateB = new Date(b.expired_at).getTime();
        return dateA - dateB;
      });

      setIngredients(sorted);
    } catch (error) {
      console.error('초기 데이터 로드 실패:', error);
      showAlert('오류', '데이터를 불러오지 못했습니다.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // 2. 🔔 실제 소비기한 기준 스케줄 푸시 알림 등록 함수
  const updateRealPushNotifications = async (option: string, items: RefrigeratorItem[]) => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const offsetDays = option === '당일' ? 0 : option === '1일 전' ? 1 : 3;
      const now = new Date();
      let scheduledCount = 0;

      for (const item of items) {
        if (!item.expired_at) continue;

        const [year, month, day] = item.expired_at.split('-').map(Number);
        const triggerDate = new Date(year, month - 1, day);
        triggerDate.setDate(triggerDate.getDate() - offsetDays);
        triggerDate.setHours(9, 0, 0, 0);

        if (triggerDate.getTime() > now.getTime()) {
          const itemName = item.ingredient_name || item.name || '식재료';
          const bodyText =
            offsetDays === 0
              ? `[${itemName}]의 소비기한이 오늘까지입니다! 오늘 안으로 요리해 보세요.`
              : `[${itemName}]의 소비기한이 ${offsetDays}일 남았습니다. 미리 확인해 주세요!`;

          await Notifications.scheduleNotificationAsync({
            content: {
              title: '🔔 MealMate 소비기한 알림',
              body: bodyText,
              sound: true,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: triggerDate,
            },
          });
          scheduledCount++;
        }
      }

      return scheduledCount;
    } catch (err) {
      console.error('푸시 알림 스케줄링 실패:', err);
      return 0;
    }
  };

  // 3. 알림 옵션 선택 및 저장 핸들러
  const handleOptionSelect = async (option: string) => {
    try {
      setAlertDaysOption(option);
      // 로컬 스토리지에 사용자 설정 저장
      await AsyncStorage.setItem(STORAGE_KEY, option);

      const count = await updateRealPushNotifications(option, ingredients);

      if (count > 0) {
        showAlert(
          '알림 설정 완료',
          `[${option}] 기준으로 총 ${count}개 식재료의 소비기한 푸시 알림이 예약되었습니다.`,
          'success'
        );
      } else {
        showAlert(
          '알림 설정 완료',
          `[${option}] 기준 알림 설정이 완료되었습니다.\n(현재 예약 대상인 남은 식재료가 없습니다)`,
          'info'
        );
      }
    } catch (error) {
      console.error('알림 옵션 저장 에러:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>소비기한 임박 재료</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* 푸시 알림 설정 카드 */}
      <View style={styles.settingCard}>
        <View style={styles.settingHeader}>
          <MaterialCommunityIcons name="bell-ring-outline" size={20} color={Colors.light.primary} />
          <Text style={styles.settingTitle}>푸시 알림 기준 설정</Text>
        </View>
        <View style={styles.optionsRow}>
          {ALERT_OPTIONS.map((option) => {
            const isActive = alertDaysOption === option;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.optionChip, isActive && styles.optionChipActive]}
                onPress={() => handleOptionSelect(option)}
              >
                <Text style={[styles.optionChipText, isActive && styles.optionChipTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 임박 리스트 */}
      <FlatList
        data={ingredients}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>소비기한 임박 재료가 없습니다.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const dday = calculateDDay(item.expired_at);
          const isUrgent = dday <= 3;
          const name = item.ingredient_name || item.name || '식재료';
          const qtyDisplay = item.quantity_display || `${item.quantity ?? 1}${item.ingredient_unit || item.unit || '개'}`;

          let dDayStr = `D-${dday}`;
          if (dday === 0) dDayStr = 'D-Day';
          else if (dday < 0) dDayStr = `만료 D+${Math.abs(dday)}`;

          return (
            <View style={styles.alertListItem}>
              <View style={styles.leftContent}>
                <View style={[styles.dDayBadge, isUrgent && styles.dDayBadgeUrgent]}>
                  <Text style={[styles.dDayText, isUrgent && styles.dDayTextUrgent]}>
                    {dDayStr}
                  </Text>
                </View>
                <View style={styles.infoBlock}>
                  <Text style={styles.itemName}>{name}</Text>
                  <Text style={styles.itemSub}>
                    {qtyDisplay} | {item.storage_type} 보관
                  </Text>
                </View>
              </View>
              <Text style={styles.dateText}>{item.expired_at}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  center: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111' },
  headerRightPlaceholder: { width: 40 },

  settingCard: { backgroundColor: '#F4F9F8', margin: 20, padding: 16, borderRadius: 15, borderWidth: 1, borderColor: '#E0EDE9' },
  settingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  settingTitle: { fontSize: 15, fontWeight: '700', marginLeft: 6, color: Colors.light.primary },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  optionChip: { flex: 1, backgroundColor: '#fff', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: '#E0E0E0' },
  optionChipActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  optionChipText: { fontSize: 14, color: '#666', fontWeight: '600' },
  optionChipTextActive: { color: '#fff', fontWeight: '700' },

  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  emptyText: { color: '#888', fontSize: 14 },
  alertListItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  leftContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dDayBadge: { backgroundColor: '#E0E0E0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, minWidth: 75, alignItems: 'center' },
  dDayBadgeUrgent: { backgroundColor: '#FFEDED' },
  dDayText: { fontSize: 13, fontWeight: '700', color: '#666' },
  dDayTextUrgent: { color: '#FF3B30' },
  infoBlock: { marginLeft: 14, flex: 1 },
  itemName: { fontSize: 16, fontWeight: '700', color: '#222' },
  itemSub: { fontSize: 12, color: '#888', marginTop: 4 },
  dateText: { fontSize: 13, color: '#999', fontWeight: '500' },
});