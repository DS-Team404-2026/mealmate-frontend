import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from "react-native";
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
    <View style={styles.container}>
      <Text style={styles.title}>계정 생성</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={20} color="#7A7A7A" style={styles.inputIcon} />
        <TextInput placeholder="이메일" style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="person" size={20} color="#7A7A7A" style={styles.inputIcon} />
        <TextInput placeholder="닉네임" style={styles.input} value={nickname} onChangeText={setNickname} />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={20} color="#7A7A7A" style={styles.inputIcon} />
        <TextInput placeholder="비밀번호" secureTextEntry style={styles.input} value={password} onChangeText={setPassword} />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="checkmark-circle" size={20} color="#7A7A7A" style={styles.inputIcon} />
        <TextInput placeholder="비밀번호 확인" secureTextEntry style={styles.input} value={passwordConfirm} onChangeText={setPasswordConfirm} />
      </View>

      <TouchableOpacity style={[styles.signupButton, isLoading && { opacity: 0.7 }]} onPress={handleSignup} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.signupButtonText}>가입하기</Text>}
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>이미 계정이 있으신가요? </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.loginLink}>로그인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8", paddingHorizontal: 30, paddingTop: 70 },
  title: { fontSize: 42, fontWeight: "800", color: "#000", marginBottom: 40 },
  inputContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#CFCFCF", borderRadius: 14, backgroundColor: "#FFF", paddingHorizontal: 15, height: 58, marginBottom: 16 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: "#000" },
  signupButton: { backgroundColor: Colors.light.primary, height: 58, borderRadius: 8, justifyContent: "center", alignItems: "center", marginTop: 20, marginBottom: 40 },
  signupButtonText: { color: "#FFF", fontSize: 20, fontWeight: "700" },
  loginContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  loginText: { color: "#666", fontSize: 16 },
  loginLink: { color: Colors.light.primary, fontSize: 16, fontWeight: "700", textDecorationLine: "underline" },
});