import { Colors } from "@/constants/theme";
import { useAuthStore } from "@/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
    <View style={styles.container}>
      <Text style={styles.title}>시작해{"\n"}볼까요!</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="person" size={20} color="#7A7A7A" style={styles.inputIcon} />
        <TextInput
          placeholder="이메일"
          placeholderTextColor="#7A7A7A"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={20} color="#7A7A7A" style={styles.inputIcon} />
        <TextInput
          placeholder="비밀번호"
          placeholderTextColor="#7A7A7A"
          secureTextEntry={securePassword}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity activeOpacity={0.7} onPress={() => setSecurePassword((prev) => !prev)}>
          <Ionicons name={securePassword ? "eye-off-outline" : "eye-outline"} size={22} color="#7A7A7A" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.forgotContainer} onPress={() => router.push("/(auth)/forgot-password")}>
        <Text style={styles.forgotText}>비밀번호를 잊으셨나요?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.loginButtonText}>로그인</Text>}
      </TouchableOpacity>

      <Text style={styles.divider}>간편 로그인</Text>
      
      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialButton}><Ionicons name="logo-google" size={28} color="#000" /></TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}><Ionicons name="logo-apple" size={28} color="#000" /></TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}><Ionicons name="chatbubble" size={24} color="#000" /></TouchableOpacity>
      </View>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>계정이 없으신가요? </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
          <Text style={styles.signupLink}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8", paddingHorizontal: 30, paddingTop: 70 },
  title: { fontSize: 52, fontWeight: "800", color: "#000", marginBottom: 50, lineHeight: 58 },
  inputContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#CFCFCF", borderRadius: 14, backgroundColor: "#FFF", paddingHorizontal: 15, height: 58, marginBottom: 22 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: "#000" },
  forgotContainer: { alignItems: "flex-end", marginTop: -10, marginBottom: 45 },
  forgotText: { color: Colors.light.primary, fontSize: 14 },
  loginButton: { backgroundColor: Colors.light.primary, height: 58, borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: 70 },
  loginButtonText: { color: "#FFF", fontSize: 24, fontWeight: "700" },
  divider: { textAlign: "center", color: "#666", marginBottom: 30, fontSize: 14 },
  socialContainer: { flexDirection: "row", justifyContent: "center", gap: 18, marginBottom: 40 },
  socialButton: { width: 62, height: 62, borderRadius: 31, borderWidth: 1, borderColor: Colors.light.primary, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  signupContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  signupText: { color: "#666", fontSize: 16 },
  signupLink: { color: Colors.light.primary, fontSize: 16, fontWeight: "700", textDecorationLine: "underline" },
});