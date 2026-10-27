import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAlert } from "../../components/CustomAlert";
import { UserService } from "../../services/user.service";

export default function ProfileScreen() {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);

  // 1. 마이페이지 상태
  const [nickname, setNickname] = useState("");
  const [housing, setHousing] = useState("자취");
  const [cookingLevel, setCookingLevel] = useState("보통");
  const [preferences, setPreferences] = useState<string[]>([]);

  const togglePreference = (item: string) => {
    setPreferences((prev) =>
      prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item],
    );
  };

  // 2. 사용자 환경 상태 (백엔드 명세에 맞춘 4가지 조리기구: 인덕션, 전자레인지, 에어프라이어, 블렌더)
  const [appliances, setAppliances] = useState<string[]>([]);
  const toggleAppliance = (item: string) => {
    setAppliances((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item],
    );
  };

  // 3. 건강 정보 상태
  const [bmiMode, setBmiMode] = useState<"calc" | "direct">("calc");
  const [bmiValue, setBmiValue] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const handleCalculateBMI = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      const calculated = (w / (h * h)).toFixed(1);
      setBmiValue(calculated);
      showAlert(
        "계산 완료",
        `측정된 BMI 지수는 ${calculated}입니다.`,
        "success",
      );
    } else {
      showAlert("알림", "올바른 키와 몸무게를 입력해주세요.", "warning");
    }
  };

  const [bloodPressureMode, setBpMode] = useState<"normal" | "value">("normal");
  const [systolic, setBpSystolic] = useState("");
  const [diastolic, setBpDiastolic] = useState("");
  const [bpStage, setBpStage] = useState("정상");
  const [bloodSugar, setBloodSugar] = useState("");

  const [diseases, setDiseases] = useState<string[]>([]);
  const [customDisease, setCustomDisease] = useState("");
  const toggleDisease = (item: string) => {
    setDiseases((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item],
    );
  };

  // 4. 알레르기 유발 항원 정보 (배열 형태 처리)
  const [allergenTags, setAllergenTags] = useState<string[]>([]);
  const [allergenInput, setAllergenInput] = useState("");

  const handleAddAllergenTag = (text: string) => {
    const trimmed = text.trim().replace(/,/g, "");
    if (trimmed && !allergenTags.includes(trimmed)) {
      setAllergenTags((prev) => [...prev, trimmed]);
    }
    setAllergenInput("");
  };

  const handleRemoveAllergenTag = (tagToRemove: string) => {
    setAllergenTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleAllergenTextChange = (text: string) => {
    if (text.endsWith(" ") || text.endsWith(",")) {
      handleAddAllergenTag(text);
    } else {
      setAllergenInput(text);
    }
  };

  // ==============================
  // 데이터 불러오기 (GET)
  // ==============================
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [profileRes, envRes, healthRes] = await Promise.all([
        UserService.getProfile(),
        UserService.getEnvironment(),
        UserService.getHealthProfile(),
      ]);

      // 1. 프로필 정보 바인딩
      if (profileRes.data) {
        const pData = profileRes.data as any;
        setNickname(pData.nickname || "");
        setHousing(pData.housing || "자취");
        setPreferences(pData.preference || []);
        if (pData.cooking_level === 1) setCookingLevel("초보");
        else if (pData.cooking_level === 2) setCookingLevel("보통");
        else if (pData.cooking_level === 3) setCookingLevel("숙련");
      }

      // 2. 조리 환경 바인딩 (백엔드 4가지 필드 매핑)
      if (envRes.data) {
        const eData = envRes.data as any;
        const activeAppliances: string[] = [];
        if (eData.induction) activeAppliances.push("인덕션");
        if (eData.microwave) activeAppliances.push("전자레인지");
        if (eData.airfryer) activeAppliances.push("에어프라이어");
        if (eData.blender) activeAppliances.push("블렌더");
        setAppliances(activeAppliances);
      }

      // 3. 건강 정보 바인딩
      if (healthRes.data) {
        const hData = healthRes.data as any;
        setHeight(hData.height ? String(hData.height) : "");
        setWeight(hData.weight ? String(hData.weight) : "");
        setBmiValue(hData.bmi ? String(hData.bmi) : "");
        setBpStage(hData.blood_pressure || "정상");

        if (hData.allergies) {
          if (Array.isArray(hData.allergies)) {
            setAllergenTags(hData.allergies);
          } else if (typeof hData.allergies === "string") {
            setAllergenTags(
              hData.allergies.split(",").map((item: string) => item.trim()).filter(Boolean)
            );
          }
        } else if (hData.allergen) {
          setAllergenTags(
            hData.allergen.split(",").map((item: string) => item.trim()).filter(Boolean)
          );
        } else {
          setAllergenTags([]);
        }

        if (hData.diseases) {
          if (Array.isArray(hData.diseases)) {
            setDiseases(hData.diseases);
          } else if (typeof hData.diseases === "string") {
            setDiseases(
              (hData.diseases as string)
                .split(",")
                .map((d: string) => d.trim()),
            );
          }
        }
      }
    } catch (error) {
      console.error("데이터 로딩 에러:", error);
      showAlert("알림", "저장된 프로필 정보를 불러오지 못했습니다.", "warning");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ==============================
  // 데이터 저장하기 (PATCH)
  // ==============================
  const handleSaveProfile = async () => {
    try {
      let levelInt = 2;
      if (cookingLevel === "초보") levelInt = 1;
      if (cookingLevel === "숙련") levelInt = 3;

      let finalAllergenTags = [...allergenTags];
      if (allergenInput.trim()) {
        const trimmed = allergenInput.trim().replace(/,/g, "");
        if (trimmed && !finalAllergenTags.includes(trimmed)) {
          finalAllergenTags.push(trimmed);
          setAllergenTags(finalAllergenTags);
          setAllergenInput("");
        }
      }

      const profileData = {
        nickname: nickname,
        cooking_level: levelInt,
        housing: housing,
        preference: preferences,
      };

      // 💡 백엔드 명세에 정확히 맞춘 조리 환경 페이로드 (4가지 boolean 필드)
      const envData = {
        induction: appliances.includes("인덕션"),
        microwave: appliances.includes("전자레인지"),
        airfryer: appliances.includes("에어프라이어"),
        blender: appliances.includes("블렌더"),
      };

      const parsedHeight = parseInt(height, 10);
      const parsedWeight = parseInt(weight, 10);

      const healthData: any = {
        blood_pressure: bloodPressureMode === "normal" ? "정상" : bpStage,
        diseases: [...diseases, customDisease].filter(Boolean),
        allergies: finalAllergenTags,
        diets: preferences.filter((p) =>
          ["저염", "저당", "채식", "저탄수", "고단백", "저염식"].includes(p),
        ),
      };

      if (!isNaN(parsedHeight)) healthData.height = parsedHeight;
      if (!isNaN(parsedWeight)) healthData.weight = parsedWeight;

      await Promise.all([
        UserService.updateProfile(profileData),
        UserService.updateEnvironment(envData),
        UserService.updateHealthProfile(healthData),
      ]);

      showAlert(
        "저장 완료",
        "레시피 추천을 위한 개인 맞춤 정보가 성공적으로 반영되었습니다.",
        "success",
      );
    } catch (error: any) {
      console.error("저장 실패 상세:", error);
      let errorMessage = "데이터를 저장하는 중 문제가 발생했습니다.";
      if (error.response && error.response.data) {
        errorMessage = JSON.stringify(error.response.data, null, 2);
      }
      showAlert("저장 실패", errorMessage, "warning");
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeader}>
        <Text style={styles.userName}>{nickname} 님</Text>
        <Text style={styles.userSub}>
          나에게 딱 맞는 스마트 레시피 분석 인프라
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>주거 형태</Text>
        <View style={styles.rowContainer}>
          {["자취", "가족주거", "기타"].map((item) => {
            const isSelected = housing === item;
            return (
              <TouchableOpacity
                key={item}
                style={[styles.radioCell, isSelected && styles.radioCellActive]}
                onPress={() => setHousing(item)}
              >
                <Text
                  style={[
                    styles.radioText,
                    isSelected && styles.radioTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 💡 백엔드 명세에 맞춘 4가지 조리기구 환경 선택 */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>보유 조리기구 환경</Text>
        <View style={styles.chipGrid}>
          {["인덕션", "전자레인지", "에어프라이어", "블렌더"].map((item) => {
            const isSelected = appliances.includes(item);
            return (
              <TouchableOpacity
                key={item}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => toggleAppliance(item)}
              >
                <Text
                  style={[styles.chipText, isSelected && styles.chipTextActive]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>요리 실력 단계</Text>
        <View style={styles.rowContainer}>
          {["초보", "보통", "숙련"].map((level) => {
            const isSelected = cookingLevel === level;
            return (
              <TouchableOpacity
                key={level}
                style={[styles.radioCell, isSelected && styles.radioCellActive]}
                onPress={() => setCookingLevel(level)}
              >
                <Text
                  style={[
                    styles.radioText,
                    isSelected && styles.radioTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>신체 상태 및 건강 수치 (BMI)</Text>
        <View style={[styles.rowContainer, { marginBottom: 15 }]}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              bmiMode === "calc" && styles.tabButtonActive,
            ]}
            onPress={() => setBmiMode("calc")}
          >
            <Text
              style={[
                styles.tabButtonText,
                bmiMode === "calc" && styles.tabButtonTextActive,
              ]}
            >
              키/몸무게 입력 계산
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              bmiMode === "direct" && styles.tabButtonActive,
            ]}
            onPress={() => setBmiMode("direct")}
          >
            <Text
              style={[
                styles.tabButtonText,
                bmiMode === "direct" && styles.tabButtonTextActive,
              ]}
            >
              BMI 직접 입력
            </Text>
          </TouchableOpacity>
        </View>

        {bmiMode === "calc" ? (
          <View style={styles.inlineForm}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.subLabel}>키 (cm)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="예: 165"
                value={height}
                onChangeText={setHeight}
              />
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.subLabel}>몸무게 (kg)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="예: 55"
                value={weight}
                onChangeText={setWeight}
              />
            </View>
            <TouchableOpacity
              style={styles.calcActionBtn}
              onPress={handleCalculateBMI}
            >
              <Text style={styles.calcActionText}>계산</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.subLabel}>BMI 지수 직접 입력</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={bmiValue}
              onChangeText={setBmiValue}
              placeholder="20.2"
            />
          </View>
        )}
        <Text style={styles.resultDisplayBlock}>
          현재 설정된 BMI 지수:{" "}
          <Text style={{ color: Colors.light.primary, fontWeight: "800" }}>
            {bmiValue}
          </Text>
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>혈압 및 혈당 관리</Text>
        <Text style={styles.subLabel}>혈압 상태 분기</Text>
        <View style={[styles.rowContainer, { marginBottom: 12 }]}>
          <TouchableOpacity
            style={[
              styles.radioCell,
              bloodPressureMode === "normal" && styles.radioCellActive,
            ]}
            onPress={() => setBpMode("normal")}
          >
            <Text
              style={[
                styles.radioText,
                bloodPressureMode === "normal" && styles.radioTextActive,
              ]}
            >
              정상
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.radioCell,
              bloodPressureMode === "value" && styles.radioCellActive,
            ]}
            onPress={() => setBpMode("value")}
          >
            <Text
              style={[
                styles.radioText,
                bloodPressureMode === "value" && styles.radioTextActive,
              ]}
            >
              수치 직접 입력 / 고혈압
            </Text>
          </TouchableOpacity>
        </View>

        {bloodPressureMode === "value" && (
          <View>
            <View style={styles.inlineForm}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.subLabel}>수축기 (mmHg)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="135"
                  value={systolic}
                  onChangeText={setBpSystolic}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.subLabel}>이완기 (mmHg)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="85"
                  value={diastolic}
                  onChangeText={setBpDiastolic}
                />
              </View>
            </View>

            <Text style={styles.subLabel}>고혈압 단계 선택</Text>
            <View style={styles.rowContainer}>
              {["1기 고혈압", "2기 고혈압"].map((stage) => (
                <TouchableOpacity
                  key={stage}
                  style={[
                    styles.radioCell,
                    bpStage === stage && styles.radioCellActive,
                  ]}
                  onPress={() => setBpStage(stage)}
                >
                  <Text
                    style={[
                      styles.radioText,
                      bpStage === stage && styles.radioTextActive,
                    ]}
                  >
                    {stage}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Text style={[styles.subLabel, { marginTop: 12 }]}>
          공복 혈당 수치 (mg/dL)
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={bloodSugar}
          onChangeText={setBloodSugar}
          placeholder="95"
        />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>보유 만성 질환 정보</Text>
        <View style={styles.checkboxGrid}>
          {["당뇨", "고혈압", "고지혈증"].map((item) => {
            const isChecked = diseases.includes(item);
            return (
              <TouchableOpacity
                key={item}
                style={styles.checkboxRow}
                onPress={() => toggleDisease(item)}
              >
                <Ionicons
                  name={isChecked ? "checkbox" : "square-outline"}
                  size={22}
                  color={Colors.light.primary}
                />
                <Text style={styles.checkboxLabel}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[styles.subLabel, { marginTop: 10 }]}>
          기타 질환 자유 입력
        </Text>
        <TextInput
          style={styles.input}
          value={customDisease}
          onChangeText={setCustomDisease}
          placeholder="기타 질환 명칭 입력"
        />
      </View>

      {/* 알레르기 유발 항원 정보 (지메일 스타일 태그 입력창) */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>알레르기 유발 항원 정보</Text>
        <View style={styles.tagInputContainer}>
          {allergenTags.map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagChipText}>{tag}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveAllergenTag(tag)}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                style={styles.tagRemoveBtn}
              >
                <Ionicons name="close" size={14} color="#666" />
              </TouchableOpacity>
            </View>
          ))}
          <TextInput
            style={styles.tagTextInput}
            value={allergenInput}
            onChangeText={handleAllergenTextChange}
            onSubmitEditing={() => handleAddAllergenTag(allergenInput)}
            placeholder={
              allergenTags.length === 0
                ? "예: 갑각류, 우유 (스페이스바 또는 엔터)"
                : ""
            }
            placeholderTextColor="#999"
            blurOnSubmit={false}
            returnKeyType="done"
          />
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>선호 취향 및 제약 식단 설정</Text>
        <View style={styles.chipGrid}>
          {[
            "한식",
            "양식",
            "일식",
            "채식",
            "저염",
            "저당",
            "저탄수",
            "고단백",
          ].map((item) => {
            const isSelected = preferences.includes(item);
            return (
              <TouchableOpacity
                key={item}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => togglePreference(item)}
              >
                <Text
                  style={[styles.chipText, isSelected && styles.chipTextActive]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveMainButton}
        onPress={handleSaveProfile}
      >
        <Text style={styles.saveMainText}>맞춤형 설정 정보 저장하기</Text>
      </TouchableOpacity>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  profileHeader: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 25,
    backgroundColor: Colors.light.background,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 15,
  },
  userName: { fontSize: 22, fontWeight: "800", color: "#222" },
  userSub: { fontSize: 13, color: "#666", marginTop: 6 },
  sectionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
    marginBottom: 14,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#777",
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
    height: 45,
  },
  tagInputContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minHeight: 45,
    marginBottom: 10,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginVertical: 4,
  },
  tagChipText: { fontSize: 13, color: "#333", fontWeight: "600" },
  tagRemoveBtn: { marginLeft: 4, justifyContent: "center", alignItems: "center" },
  tagTextInput: {
    flex: 1,
    minWidth: 120,
    fontSize: 14,
    color: "#333",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  chipGrid: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  chipActive: { backgroundColor: "#E8F2F1", borderColor: Colors.light.primary },
  chipText: { fontSize: 13, color: "#666", fontWeight: "500" },
  chipTextActive: { color: Colors.light.primary, fontWeight: "700" },
  rowContainer: { flexDirection: "row", justifyContent: "space-between" },
  radioCell: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 4,
  },
  radioCellActive: { backgroundColor: Colors.light.primary },
  radioText: { fontSize: 14, color: "#666", fontWeight: "600" },
  radioTextActive: { color: "#fff", fontWeight: "700" },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabButtonActive: {
    backgroundColor: "#E8F2F1",
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  tabButtonText: { fontSize: 12, color: "#777", fontWeight: "600" },
  tabButtonTextActive: { color: Colors.light.primary, fontWeight: "700" },
  inlineForm: { flexDirection: "row", alignItems: "flex-end" },
  calcActionBtn: {
    backgroundColor: Colors.light.primary,
    height: 45,
    marginBottom: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  calcActionText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  resultDisplayBlock: {
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 13,
    color: "#444",
    fontWeight: "600",
    marginTop: 5,
  },
  checkboxGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  checkboxRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  checkboxLabel: { fontSize: 14, fontWeight: "600", color: "#333", marginLeft: 6 },
  saveMainButton: {
    backgroundColor: Colors.light.primary,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    elevation: 3,
  },
  saveMainText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});