import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/constants/theme";

export default function ForgotPasswordScreen() {
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>
        Forgot{"\n"}
        password?
      </Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Ionicons
          name="mail"
          size={20}
          color="#7A7A7A"
          style={styles.inputIcon}
        />

        <TextInput
          placeholder="Enter your email address"
          placeholderTextColor="#7A7A7A"
          style={styles.input}
        />
      </View>

      {/* Description */}
      <Text style={styles.description}>
        * We will send you a message to set or reset{"\n"}
        your new password
      </Text>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
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
    marginBottom: 25,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },

  description: {
    fontSize: 14,
    color: "#7A7A7A",
    lineHeight: 22,
    marginBottom: 45,
  },

  submitButton: {
    backgroundColor: Colors.light.primary,
    height: 58,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  submitButtonText: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "700",
  },
});