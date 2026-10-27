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
import { Colors } from "@/constants/theme";
import { useAuthStore } from "@/store/auth.store";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  
  const { signup, isLoading } = useAuthStore(); // 스토어에서 함수 불러오기

  const handleSignup = async () => {
    if (!email || !nickname || !password || !passwordConfirm) {
      Alert.alert("알림", "모든 필드를 입력해주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      Alert.alert("알림", "비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    // 스토어의 signup 함수 실행
    const isSuccess = await signup({
      email: email,
      password: password,
      password_confirm: passwordConfirm,
      nickname: nickname
    });

    if (isSuccess) {
      router.back(); // 회원가입 성공 시 이전(로그인) 화면으로 돌아가기
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
          <Text style={styles.title}>계정 생성</Text>
        </View>

        {/* 입력 폼 영역 */}
        <View style={styles.formSection}>
          <View style={styles.field}>
            <Text style={styles.label}>이메일</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#8A9399" style={styles.inputIcon} />
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
            <Text style={styles.label}>닉네임</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#8A9399" style={styles.inputIcon} />
              <TextInput
                placeholder="닉네임"
                placeholderTextColor="#A5ADB2"
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
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
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>비밀번호 확인</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#8A9399" style={styles.inputIcon} />
              <TextInput
                placeholder="비밀번호 확인"
                placeholderTextColor="#A5ADB2"
                secureTextEntry
                style={styles.input}
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.signupButton, isLoading && { opacity: 0.7 }]}
            onPress={handleSignup}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.signupButtonText}>가입하기</Text>}
          </TouchableOpacity>

          {/* 로그인 이동 (가입 버튼 바로 아래) */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>이미 계정이 있으신가요? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>로그인</Text>
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
  headerSection: { marginBottom: 36 },
  // 이미지 내부 투명 여백이 커서, 큰 이미지를 박스 중앙에 겹쳐 로고만 왼쪽 정렬되도록 배치
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
  field: { marginBottom: 18 },
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

  signupButton: {
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
  signupButtonText: { color: "#FFF", fontSize: 17, fontWeight: "700" },

  // 로그인 이동
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  loginText: { color: "#777", fontSize: 14 },
  loginLink: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});