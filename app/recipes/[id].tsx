import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAlert } from '@/components/CustomAlert';
import { RecipeService, RecipeDetailResponse } from '@/services/recipe.service';

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id, recommendation_id } = useLocalSearchParams();
  const { showAlert } = useAlert();

  const recipeId = Number(id);
  const recId = recommendation_id ? Number(recommendation_id) : null;

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<RecipeDetailResponse | null>(null);
  const [steps, setSteps] = useState<{ step_number: number; instruction: string }[]>([]);

  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [preference, setPreference] = useState<'상' | '중' | '하'>('상');

  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [likeDislike, setLikeDislike] = useState<number>(3); 
  const [diffResult, setDiffResult] = useState<number>(2);
  const [comment, setComment] = useState('');

  const fetchRecipeInfo = async () => {
    try {
      setLoading(true);
      const [detailRes, stepsRes] = await Promise.all([
        RecipeService.getRecipeDetail(recipeId),
        RecipeService.getRecipeSteps(recipeId),
      ]);

      if (detailRes.data) setDetail(detailRes.data);
      if (stepsRes.data && stepsRes.data.steps) {
        setSteps(stepsRes.data.steps);
      }
    } catch (error) {
      console.error('레시피 상세 조회 실패:', error);
      showAlert('오류', '레시피 정보를 불러올 수 없습니다.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recipeId) fetchRecipeInfo();
  }, [recipeId]);

  const handleSaveRecipeBook = async () => {
    try {
      await RecipeService.saveRecipeBook({
        recipe_id: recipeId,
        is_favorite: true,
        preference: preference,
        fail_reason: null
      });
      showAlert('저장 완료', '나의 레시피북에 저장되었습니다.', 'success');
      setSaveModalVisible(false);
    } catch (error) {
      console.error('레시피 저장 실패:', error);
      showAlert('오류', '레시피 저장에 실패했습니다.', 'warning');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!recId) {
      showAlert('알림', '추천 기록 정보가 없어 후기를 작성할 수 없습니다.', 'warning');
      return;
    }
    try {
      await RecipeService.createFeedback({
        recommendation_id: recId,
        like_dislike: likeDislike,
        difficulty_result: diffResult,
        comment: comment.trim(),
      });
      showAlert('등록 성공', '레시피 후기가 정상 등록되었습니다.', 'success');
      setFeedbackModalVisible(false);
      setComment('');
    } catch (error) {
      console.error('후기 등록 실패:', error);
      showAlert('오류', '후기 등록 중 문제가 발생했습니다.', 'warning');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  // 수정사항 4: 통짜 텍스트를 콤마 또는 줄바꿈 기준으로 배열화
  const ingredientsList = detail?.ingredient_lines
    ?.split(/,|\n/)
    .map(item => item.trim())
    .filter(Boolean) || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.circleBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{detail?.title || '레시피 상세'}</Text>
        <TouchableOpacity onPress={() => setSaveModalVisible(true)} style={styles.circleBtn}>
          <Ionicons name="bookmark-outline" size={22} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.recipeTitle}>{detail?.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="time-outline" size={15} color={Colors.light.primary} />
              <Text style={styles.metaText}>{detail?.cooking_time}분</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="flame-outline" size={15} color={Colors.light.primary} />
              <Text style={styles.metaText}>{detail?.calories} kcal</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="speedometer-outline" size={15} color={Colors.light.primary} />
              <Text style={styles.metaText}>난이도 {detail?.difficulty}</Text>
            </View>
          </View>
        </View>

        {/* 수정사항 4: 필요 식재료 디자인 요소 적용 */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="basket-outline" size={20} color={Colors.light.primary} />
            <Text style={styles.sectionTitle}>필요 식재료</Text>
          </View>
          <View style={styles.ingredientGrid}>
            {ingredientsList.map((ing, idx) => (
              <View key={idx} style={styles.ingredientChip}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.light.primary} />
                <Text style={styles.ingredientChipText}>{ing}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list-outline" size={20} color={Colors.light.primary} />
            <Text style={styles.sectionTitle}>조리 순서</Text>
          </View>
          {steps.map((step) => (
            <View key={step.step_number} style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{step.step_number}</Text>
              </View>
              <Text style={styles.stepDesc}>{step.instruction.replace(/^\d+\.\s*/, '')}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* 수정사항 6: 하단 액션 바 높이(paddingBottom) 증가 */}
      <View style={styles.bottomBar}>
        {recId ? (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E8F2F1' }]} onPress={() => setFeedbackModalVisible(true)} activeOpacity={0.85}>
            <Ionicons name="chatbox-ellipses-outline" size={18} color={Colors.light.primary} />
            <Text style={[styles.actionBtnText, { color: Colors.light.primary }]}>후기 작성</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.light.primary }]} onPress={() => setSaveModalVisible(true)} activeOpacity={0.85}>
          <Ionicons name="bookmark" size={18} color="#FFF" />
          <Text style={[styles.actionBtnText, { color: '#FFF' }]}>레시피북 저장</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={saveModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>레시피북 저장</Text>
              <TouchableOpacity onPress={() => setSaveModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>나의 선호도 평가</Text>
            <View style={styles.choiceRow}>
              {(['상', '중', '하'] as const).map((pref) => {
                const active = preference === pref;
                return (
                  <TouchableOpacity key={pref} style={[styles.choiceBtn, active && styles.choiceBtnActive]} onPress={() => setPreference(pref)}>
                    <Ionicons
                      name={pref === '상' ? 'thumbs-up-outline' : pref === '중' ? 'ellipsis-horizontal-circle-outline' : 'thumbs-down-outline'}
                      size={18}
                      color={active ? '#FFF' : '#8A9399'}
                    />
                    <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{pref}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSaveRecipeBook} activeOpacity={0.85}>
              <Text style={styles.submitBtnText}>저장하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={feedbackModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>레시피 후기 등록</Text>
              <TouchableOpacity onPress={() => setFeedbackModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#333" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.label}>추천 만족도</Text>
            <View style={styles.choiceRow}>
              <TouchableOpacity style={[styles.choiceBtn, likeDislike === 3 && styles.choiceBtnActive]} onPress={() => setLikeDislike(3)}>
                <Ionicons name="thumbs-up-outline" size={18} color={likeDislike === 3 ? '#FFF' : '#8A9399'} />
                <Text style={[styles.choiceText, likeDislike === 3 && styles.choiceTextActive]}>만족</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.choiceBtn, likeDislike === 1 && styles.choiceBtnActive]} onPress={() => setLikeDislike(1)}>
                <Ionicons name="thumbs-down-outline" size={18} color={likeDislike === 1 ? '#FFF' : '#8A9399'} />
                <Text style={[styles.choiceText, likeDislike === 1 && styles.choiceTextActive]}>불만족</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>체감 난이도</Text>
            <View style={styles.choiceRow}>
              {[{ val: 1, text: '쉬움 (하)' }, { val: 2, text: '보통 (중)' }, { val: 3, text: '어려움 (상)' }].map((item) => (
                <TouchableOpacity key={item.val} style={[styles.choiceBtn, diffResult === item.val && styles.choiceBtnActive]} onPress={() => setDiffResult(item.val)}>
                  <Text style={[styles.choiceText, diffResult === item.val && styles.choiceTextActive]}>{item.text}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>후기 코멘트</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="조리 후 느끼신 점을 공유해주세요."
              placeholderTextColor="#A5ADB2"
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitFeedback} activeOpacity={0.85}>
              <Text style={styles.submitBtnText}>등록하기</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { justifyContent: 'center', alignItems: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 54, paddingBottom: 12 },
  circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F4F6F6', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', flex: 1, textAlign: 'center', marginHorizontal: 12, color: '#111' },

  summaryCard: { marginHorizontal: 20, marginTop: 8, marginBottom: 24, padding: 20, backgroundColor: '#F4F6F6', borderRadius: 22 },
  recipeTitle: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 14, letterSpacing: -0.6 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10 },
  metaText: { fontSize: 12, color: '#444', fontWeight: '700', marginLeft: 5 },

  sectionCard: { marginHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#111', marginLeft: 8, letterSpacing: -0.3 },
  
  // 식재료 칩 리스트 스타일 추가
  ingredientGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#EEF0F0' },
  ingredientChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  ingredientChipText: { fontSize: 13, color: '#333', fontWeight: '600', marginLeft: 6 },
  
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, backgroundColor: '#fff', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#EEF0F0' },
  stepBadge: { backgroundColor: Colors.light.primary, width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 1 },
  stepBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  stepDesc: { flex: 1, fontSize: 14, color: '#333', lineHeight: 22 },

  // paddingBottom 28 -> 48 수정
  bottomBar: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 48, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EEF0F0' },
  actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 52, borderRadius: 16, gap: 6 },
  actionBtnText: { fontSize: 14, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 32 },
  modalHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E3E4', marginBottom: 14 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 19, fontWeight: '800', color: '#111', letterSpacing: -0.3 },
  modalCloseBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F4F6F6', justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginTop: 14, marginBottom: 8, marginLeft: 2 },
  choiceRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  choiceBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, backgroundColor: '#F4F6F6', height: 46, borderRadius: 14 },
  choiceBtnActive: { backgroundColor: Colors.light.primary },
  choiceText: { fontSize: 12, color: '#7A8288', fontWeight: '600' },
  choiceTextActive: { color: '#FFF', fontWeight: '800' },
  commentInput: { backgroundColor: '#F4F6F6', borderRadius: 16, padding: 14, height: 96, textAlignVertical: 'top', fontSize: 14, color: '#111', marginBottom: 8 },
  submitBtn: {
    backgroundColor: Colors.light.primary, height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 16,
    shadowColor: Colors.light.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 4,
  },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});