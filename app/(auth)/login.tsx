import { Colors } from "@/constants/theme";
import { useAuthStore } from "@/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securePassword, setSecurePassword] = useState(true);
  
  const { login, isLoading } = useAuthStore(); // 스토어에서 함수 불러오기

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("알림", "이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }
    
    // 스토어의 login 함수 실행
    const isSuccess = await login(email, password);
    if (isSuccess) {
      router.replace("/(tabs)/home"); // 성공 시 홈 화면으로 이동
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 로고 + 타이틀 영역 */}
        <View style={styles.headerSection}>
          <View style={styles.logoWrap}>
            <Image
              source={require("@/assets/images/splash-icon.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>냉장고 속 재료로{"\n"}오늘의 한 끼를</Text>
        </View>

        {/* 입력 폼 영역 */}
        <View style={styles.formSection}>
          <View style={styles.field}>
            <Text style={styles.label}>이메일</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#8A9399" style={styles.inputIcon} />
              <TextInput
                placeholder="이메일"
                placeholderTextColor="#A5ADB2"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>비밀번호</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#8A9399" style={styles.inputIcon} />
              <TextInput
                placeholder="비밀번호"
                placeholderTextColor="#A5ADB2"
                secureTextEntry={securePassword}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSecurePassword((prev) => !prev)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name={securePassword ? "eye-off-outline" : "eye-outline"} size={22} color="#8A9399" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.loginButtonText}>로그인</Text>}
          </TouchableOpacity>

          {/* 회원가입 (로그인 버튼 바로 아래) */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>계정이 없으신가요? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={styles.signupLink}>회원가입</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 40,
  },

  // 로고 + 타이틀
  headerSection: { marginBottom: 40 },
  // 이미지 내부에 투명 여백이 커서, 큰 이미지를 박스 중앙에 겹쳐 로고만 왼쪽 정렬되도록 배치
  logoWrap: {
    width: 150,
    height: 80,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  logoImage: {
    position: "absolute",
    width: 195,
    height: 195,
    left: -22,
    top: -57,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111",
    lineHeight: 40,
    letterSpacing: -0.8,
  },

  // 폼
  formSection: {},
  field: { marginBottom: 20 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F6F6",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, color: "#111" },

  loginButton: {
    backgroundColor: Colors.light.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  loginButtonText: { color: "#FFF", fontSize: 17, fontWeight: "700" },

  // 회원가입
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  signupText: { color: "#777", fontSize: 14 },
  signupLink: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});