import { View, Text, Button } from "react-native";
import { router } from "expo-router";

export default function Login() {
  return (
    <View>
      <Text>Login Screen</Text>

      <Button
        title="Login (테스트)"
        onPress={() => router.replace("/(tabs)/home")}
      />
    </View>
  );
}