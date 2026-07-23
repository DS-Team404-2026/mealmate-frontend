import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// 이전 화면들과 통일된 시안 테마 색상 고정
const THEME_GREEN = '#417D7A';
const LIGHT_BG = '#F4F9F8';

export default function ProfileScreen() {
  // 1. 주거 환경 및 장비 (복수 선택 가능)
  const [appliances, setAppliances] = useState<string[]>(['가스레인지', '전자레인지']);
  const toggleAppliance = (item: string) => {
    setAppliances(prev => prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]);
  };

  // 2. 요리 실력 (단일 선택)
  const [cookingLevel, setCookingLevel] = useState('보통');

  // 3. 건강 수치 (BMI 직접 입력 vs 키/몸무게 계산 분기)
  const [bmiMode, setBmiMode] = useState<'direct' | 'calc'>('calc');
  const [bmiValue, setBmiValue] = useState('22.5');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // BMI 계산 로직
  const handleCalculateBMI = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      const calculated = (w / (h * h)).toFixed(1);
      setBmiValue(calculated);
      Alert.alert('계산 완료', `측정된 BMI 지수는 ${calculated}입니다.`);
    } else {
      Alert.alert('알림', '올바른 키와 몸무게를 입력해주세요.');
    }
  };

  // 4. 혈압 분기 설정
  const [bloodPressureMode, setBpMode] = useState<'normal' | 'value'>('normal');
  const [systolic, setBpSystolic] = useState(''); 
  const [diastolic, setBpDiastolic] = useState(''); 
  const [bpStage, setBpStage] = useState('정상'); 

  // 5. 혈당 수치
  const [bloodSugar, setBloodSugar] = useState('95');

  // 6. 질환 정보 체크박스 (중복 가능)
  const [diseases, setDiseases] = useState<string[]>(['고혈압']);
  const [customDisease, setCustomDisease] = useState('');
  const toggleDisease = (item: string) => {
    setDiseases(prev => prev.includes(item) ? prev.filter(d => d !== item) : [...prev, item]);
  };

  // 7. 알레르기 텍스트 입력
  const [allergy, setAllergy] = useState('갑각류, 견과류');

  // 8. 입맛/취향/식단 (중복 가능)
  const [preferences, setPreferences] = useState<string[]>(['한식', '저염', '고단백']);
  const togglePreference = (item: string) => {
    setPreferences(prev => prev.includes(item) ? prev.filter(p => p !== item) : [...prev, item]);
  };

  const handleSaveProfile = () => {
    Alert.alert('저장 완료', '레시피 추천을 위한 개인 맞춤 정보가 성공적으로 반영되었습니다.');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 상단 프로필 헤더 - 이름 변경 반영 */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle-outline" size={80} color={THEME_GREEN} />
        </View>
        <Text style={styles.userName}>편도나 님</Text>
        <Text style={styles.userSub}>나에게 딱 맞는 스마트 레시피 분석 인프라</Text>
      </View>

      {/* 섹션: 주거 환경 및 주방 장비 - 아이콘 제거 */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>주거 환경 및 보유 장비</Text>
        <View style={styles.chipGrid}>
          {['가스레인지', '인덕션', '전자레인지', '에어프라이어', '오븐', '믹서기'].map(item => {
            const isSelected = appliances.includes(item);
            return (
              <TouchableOpacity key={item} style={[styles.chip, isSelected && styles.chipActive]} onPress={() => toggleAppliance(item)}>
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 섹션: 요리 실력 - 아이콘 제거 */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>요리 실력 단계</Text>
        <View style={styles.rowContainer}>
          {['초보', '보통', '숙련'].map(level => {
            const isSelected = cookingLevel === level;
            return (
              <TouchableOpacity key={level} style={[styles.radioCell, isSelected && styles.radioCellActive]} onPress={() => setCookingLevel(level)}>
                <Text style={[styles.radioText, isSelected && styles.radioTextActive]}>{level}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 섹션: 건강 수치 및 BMI 정보 - 아이콘 제거 */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>신체 상태 및 건강 수치 (BMI)</Text>
        <View style={[styles.rowContainer, { marginBottom: 15 }]}>
          <TouchableOpacity style={[styles.tabButton, bmiMode === 'calc' && styles.tabButtonActive]} onPress={() => setBmiMode('calc')}>
            <Text style={[styles.tabButtonText, bmiMode === 'calc' && styles.tabButtonTextActive]}>키/몸무게 입력 계산</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, bmiMode === 'direct' && styles.tabButtonActive]} onPress={() => setBmiMode('direct')}>
            <Text style={[styles.tabButtonText, bmiMode === 'direct' && styles.tabButtonTextActive]}>BMI 직접 입력</Text>
          </TouchableOpacity>
        </View>

        {bmiMode === 'calc' ? (
          <View style={styles.inlineForm}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.subLabel}>키 (cm)</Text>
              <TextInput style={styles.input} keyboardType="numeric" placeholder="예: 175" value={height} onChangeText={setHeight} />
            </View>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.subLabel}>몸무게 (kg)</Text>
              <TextInput style={styles.input} keyboardType="numeric" placeholder="예: 70" value={weight} onChangeText={setWeight} />
            </View>
            <TouchableOpacity style={styles.calcActionBtn} onPress={handleCalculateBMI}>
              <Text style={styles.calcActionText}>계산</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.subLabel}>BMI 지수 직접 입력</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={bmiValue} onChangeText={setBmiValue} placeholder="22.0" />
          </View>
        )}
        <Text style={styles.resultDisplayBlock}>현재 설정된 BMI 지수: <Text style={{ color: THEME_GREEN, fontWeight: '800' }}>{bmiValue}</Text></Text>
      </View>

      {/* 섹션: 혈압 및 혈당 정보 - 아이콘 제거 */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>혈압 및 혈당 관리</Text>
        
        <Text style={styles.subLabel}>혈압 상태 분기</Text>
        <View style={[styles.rowContainer, { marginBottom: 12 }]}>
          <TouchableOpacity style={[styles.radioCell, bloodPressureMode === 'normal' && styles.radioCellActive]} onPress={() => setBpMode('normal')}>
            <Text style={[styles.radioText, bloodPressureMode === 'normal' && styles.radioTextActive]}>정상</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.radioCell, bloodPressureMode === 'value' && styles.radioCellActive]} onPress={() => setBpMode('value')}>
            <Text style={[styles.radioText, bloodPressureMode === 'value' && styles.radioTextActive]}>수치 직접 입력 / 고혈압</Text>
          </TouchableOpacity>
        </View>

        {bloodPressureMode === 'value' && (
          <View>
            <View style={styles.inlineForm}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.subLabel}>수축기 (mmHg)</Text>
                <TextInput style={styles.input} keyboardType="numeric" placeholder="135" value={systolic} onChangeText={setBpSystolic} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.subLabel}>이완기 (mmHg)</Text>
                <TextInput style={styles.input} keyboardType="numeric" placeholder="85" value={diastolic} onChangeText={setBpDiastolic} />
              </View>
            </View>
            
            <Text style={styles.subLabel}>고혈압 단계 선택</Text>
            <View style={styles.rowContainer}>
              {['1기 고혈압', '2기 고혈압'].map(stage => (
                <TouchableOpacity key={stage} style={[styles.radioCell, bpStage === stage && styles.radioCellActive]} onPress={() => setBpStage(stage)}>
                  <Text style={[styles.radioText, bpStage === stage && styles.radioTextActive]}>{stage}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Text style={[styles.subLabel, { marginTop: 12 }]}>공복 혈당 수치 (mg/dL)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={bloodSugar} onChangeText={setBloodSugar} placeholder="100" />
      </View>

      {/* 섹션: 만성 질환 정보 정보 - 아이콘 제거 */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>보유 만성 질환 정보 (중복 선택)</Text>
        <View style={styles.checkboxGrid}>
          {['당뇨', '고혈압', '고지혈증'].map(item => {
            const isChecked = diseases.includes(item);
            return (
              <TouchableOpacity key={item} style={styles.checkboxRow} onPress={() => toggleDisease(item)}>
                <Ionicons name={isChecked ? "checkbox" : "square-outline"} size={22} color={THEME_GREEN} />
                <Text style={styles.checkboxLabel}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[styles.subLabel, { marginTop: 10 }]}>기타 질환 자유 입력</Text>
        <TextInput style={styles.input} value={customDisease} onChangeText={setCustomDisease} placeholder="기타 건강 상태나 질환 명칭을 적어주세요." />
      </View>

      {/* 섹션: 알레르기 유발 항원 - 아이콘 제거 */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>알레르기 유발 항원 정보</Text>
        <Text style={styles.subLabel}>제한해야 하는 알레르기 물질 입력</Text>
        <TextInput style={styles.input} value={allergy} onChangeText={setAllergy} placeholder="예: 메밀, 땅콩, 복숭아 등 고유 명사 입력" />
      </View>

      {/* 섹션: 입맛, 종교 및 제약 식단 - 아이콘 제거 */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>선호 입맛 취향 및 제약 식단 설정</Text>
        <View style={styles.chipGrid}>
          {['한식', '양식', '일식', '채식', '저염', '저당', '저탄수', '고단백'].map(item => {
            const isSelected = preferences.includes(item);
            return (
              <TouchableOpacity key={item} style={[styles.chip, isSelected && styles.chipActive]} onPress={() => togglePreference(item)}>
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 저장하기 버튼 */}
      <TouchableOpacity style={styles.saveMainButton} onPress={handleSaveProfile}>
        <Text style={styles.saveMainText}>맞춤형 설정 정보 저장하기</Text>
      </TouchableOpacity>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  profileHeader: { alignItems: 'center', paddingVertical: 30, backgroundColor: LIGHT_BG, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: 15 },
  avatarContainer: { marginTop: 10 },
  userName: { fontSize: 20, fontWeight: '800', color: '#222', marginTop: 5 },
  userSub: { fontSize: 12, color: '#666', marginTop: 4 },
  
  sectionCard: { backgroundColor: '#fff', marginHorizontal: 20, marginVertical: 10, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 14 },
  subLabel: { fontSize: 12, fontWeight: '700', color: '#777', marginBottom: 6, marginTop: 4 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 10, padding: 12, fontSize: 14, color: '#333', marginBottom: 10 },
  
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { backgroundColor: '#F5F5F5', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E8E8E8' },
  chipActive: { backgroundColor: '#E8F2F1', borderColor: THEME_GREEN },
  chipText: { fontSize: 13, color: '#666', fontWeight: '500' },
  chipTextActive: { color: THEME_GREEN, fontWeight: '700' },
  
  rowContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  radioCell: { flex: 1, backgroundColor: '#F5F5F5', padding: 12, borderRadius: 10, alignItems: 'center', marginHorizontal: 4 },
  radioCellActive: { backgroundColor: THEME_GREEN },
  radioText: { fontSize: 14, color: '#666', fontWeight: '600' },
  radioTextActive: { color: '#fff', fontWeight: '700' },

  tabButton: { flex: 1, paddingVertical: 10, backgroundColor: '#F5F5F5', alignItems: 'center', borderRadius: 8, marginHorizontal: 4 },
  tabButtonActive: { backgroundColor: '#E8F2F1', borderWidth: 1, borderColor: THEME_GREEN },
  tabButtonText: { fontSize: 12, color: '#777', fontWeight: '600' },
  tabButtonTextActive: { color: THEME_GREEN, fontWeight: '700' },

  inlineForm: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 },
  calcActionBtn: { backgroundColor: THEME_GREEN, paddingVertical: 13, paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' },
  calcActionText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  resultDisplayBlock: { backgroundColor: LIGHT_BG, padding: 12, borderRadius: 10, textAlign: 'center', fontSize: 13, color: '#444', fontWeight: '600', marginTop: 5 },

  checkboxGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkboxLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginLeft: 6 },

  saveMainButton: { backgroundColor: THEME_GREEN, marginHorizontal: 20, marginTop: 20, padding: 16, borderRadius: 14, alignItems: 'center', elevation: 3 },
  saveMainText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});