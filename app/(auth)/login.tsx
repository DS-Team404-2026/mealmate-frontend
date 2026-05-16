import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/constants/theme";

export default function Login() {
  const [securePassword, setSecurePassword] = useState(true);

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>
        Get{"\n"}
        Started!
      </Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Ionicons
          name="person"
          size={20}
          color="#7A7A7A"
          style={styles.inputIcon}
        />

        <TextInput
          placeholder="Username or Email"
          placeholderTextColor="#7A7A7A"
          style={styles.input}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Ionicons
          name="lock-closed"
          size={20}
          color="#7A7A7A"
          style={styles.inputIcon}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#7A7A7A"
          secureTextEntry={securePassword}
          style={styles.input}
        />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setSecurePassword((prev) => !prev)}
        >
          <Ionicons
            name={securePassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#7A7A7A"
          />
        </TouchableOpacity>
      </View>

      {/* Forgot Password */}
      <TouchableOpacity style={styles.forgotContainer}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.replace("/(tabs)/home")}
      >
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      {/* Divider */}
      <Text style={styles.divider}>- OR Continue with -</Text>

      {/* Social Login */}
      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-google" size={28} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-apple" size={28} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="chatbubble" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Sign Up */}
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Create An Account </Text>

        <TouchableOpacity>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 30,
    paddingTop: 70,
  },

  title: {
    fontSize: 52,
    fontWeight: "800",
    color: "#000",
    marginBottom: 50,
    lineHeight: 58,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CFCFCF",
    borderRadius: 14,
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    height: 58,
    marginBottom: 22,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },

  forgotContainer: {
    alignItems: "flex-end",
    marginTop: -10,
    marginBottom: 45,
  },

  forgotText: {
    color: Colors.light.primary,
    fontSize: 14,
  },

  loginButton: {
    backgroundColor: Colors.light.primary,
    height: 58,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 70,
  },

  loginButtonText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "700",
  },

  divider: {
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
    fontSize: 14,
  },

  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    marginBottom: 40,
  },

  socialButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },

  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  signupText: {
    color: "#666",
    fontSize: 16,
  },

  signupLink: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});