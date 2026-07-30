import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useIngredientStore } from '@/store/ingredient.store';

const ALERT_OPTIONS = ['당일', '1일 전', '3일 전'];

export default function ExpiryAlertsScreen() {
  const router = useRouter();
  const { ingredients } = useIngredientStore();
  const [alertDays, setAlertDays] = useState('3일 전');

  // 중복 키 오류 유발 어레이를 제거하고, 중앙 스토어 데이터만 깔끔하게 바라보도록 연동
  const allIngredients = [...ingredients];

  // D-Day 연산 함수 (시연 기준일: 2026-06-16로 수정 완료)
  const calculateDDay = (expiryDateStr: string) => {
    const today = new Date('2026-06-16');
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'D-Day';
    if (diffDays < 0) return `만료 ${Math.abs(diffDays)}일 지남`;
    return `D-${diffDays}`;
  };

  // 로컬 푸시 알림 트리거 함수
  const triggerLocalNotification = async (option: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 MealMate 유통기한 알림',
        body: `[사과]의 소비기한이 ${option}입니다! 상하기 전에 요리해 보세요.`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3,
      },
    });
  };

  // 유통기한 순 정렬
  const sortedIngredients = [...allIngredients].sort((a, b) => {
    return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
  });

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
          <MaterialCommunityIcons name="bell-ring-outline" size={20} color="#417D7A" />
          <Text style={styles.settingTitle}>푸시 알림 기준 설정</Text>
        </View>
        <View style={styles.optionsRow}>
          {ALERT_OPTIONS.map((option) => {
            const isActive = alertDays === option;
            return (
              <TouchableOpacity 
                key={option} 
                style={isActive ? [styles.optionChip, styles.optionChipActive] : styles.optionChip}
                onPress={async () => {
                  setAlertDays(option);
                  await triggerLocalNotification(option);
                  Alert.alert('알림 시연 준비', `3초 뒤 스마트폰 상단에 실제 [${option}] 소비기한 푸시 알림이 발송됩니다.`);
                }}
              >
                <Text style={isActive ? [styles.optionChipText, styles.optionChipTextActive] : styles.optionChipText}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 임박 리스트 플랫리스트 */}
      <FlatList
        data={sortedIngredients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const dDayStr = calculateDDay(item.expiryDate);
          const isUrgent = dDayStr === 'D-Day' || dDayStr.includes('D-1') || dDayStr.includes('지남');

          return (
            <View style={styles.alertListItem}>
              <View style={styles.leftContent}>
                <View style={isUrgent ? [styles.dDayBadge, styles.dDayBadgeUrgent] : styles.dDayBadge}>
                  <Text style={isUrgent ? [styles.dDayText, styles.dDayTextUrgent] : styles.dDayText}>{dDayStr}</Text>
                </View>
                <View style={styles.infoBlock}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSub}>{item.quantity}{item.unit} | {item.storage} 보관</Text>
                </View>
              </View>
              <Text style={styles.dateText}>{item.expiryDate}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111' },
  headerRightPlaceholder: { width: 40 },
  settingCard: { backgroundColor: '#F4F9F8', margin: 20, padding: 16, borderRadius: 15, borderWidth: 1, borderColor: '#E0EDE9' },
  settingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  settingTitle: { fontSize: 15, fontWeight: '700', marginLeft: 6, color: '#315E5B' },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  optionChip: { flex: 1, backgroundColor: '#fff', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: '#E0E0E0' },
  optionChipActive: { backgroundColor: '#417D7A', borderColor: '#417D7A' },
  optionChipText: { fontSize: 14, color: '#666', fontWeight: '600' },
  optionChipTextActive: { color: '#fff', fontWeight: '700' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  alertListItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  leftContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dDayBadge: { backgroundColor: '#E0E0E0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, minWidth: 65, alignItems: 'center' },
  dDayBadgeUrgent: { backgroundColor: '#FFEDED' },
  dDayText: { fontSize: 13, fontWeight: '700', color: '#666' },
  dDayTextUrgent: { color: '#FF3B30' },
  infoBlock: { marginLeft: 14, flex: 1 },
  itemName: { fontSize: 16, fontWeight: '700', color: '#222' },
  itemSub: { fontSize: 12, color: '#888', marginTop: 4 },
  dateText: { fontSize: 13, color: '#999', fontWeight: '500' },
});