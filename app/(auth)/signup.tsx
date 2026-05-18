import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Colors } from "@/constants/theme";

export default function SignupScreen() {
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] =
    useState(true);

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>
        Create an{"\n"}
        account
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

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Ionicons
          name="lock-closed"
          size={20}
          color="#7A7A7A"
          style={styles.inputIcon}
        />

        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#7A7A7A"
          secureTextEntry={secureConfirmPassword}
          style={styles.input}
        />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            setSecureConfirmPassword((prev) => !prev)
          }
        >
          <Ionicons
            name={
              secureConfirmPassword
                ? "eye-off-outline"
                : "eye-outline"
            }
            size={22}
            color="#7A7A7A"
          />
        </TouchableOpacity>
      </View>

      {/* Terms Text */}
      <Text style={styles.termsText}>
        By clicking the{" "}
        <Text style={styles.registerText}>Register</Text> button,
        you agree{"\n"}to the public offer
      </Text>

      {/* Create Account Button */}
      <TouchableOpacity style={styles.createButton}>
        <Text style={styles.createButtonText}>
          Create Account
        </Text>
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

      {/* Bottom Text */}
      <View style={styles.bottomContainer}>
        <Text style={styles.bottomText}>
          Already have an account?{" "}
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.bottomLink}>Login</Text>
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
    lineHeight: 58,
    marginBottom: 40,
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
    marginBottom: 18,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },

  termsText: {
    color: "#6F6F6F",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 5,
    marginBottom: 35,
  },

  registerText: {
    color: Colors.light.primary,
  },

  createButton: {
    backgroundColor: Colors.light.primary,
    height: 58,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 70,
  },

  createButtonText: {
    color: "#FFF",
    fontSize: 22,
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

  bottomContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  bottomText: {
    color: "#666",
    fontSize: 16,
  },

  bottomLink: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});