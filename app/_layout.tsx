import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Notifications from "expo-notifications"; 
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

// 앱이 포어그라운드(켜져 있는 상태)일 때도 상단 푸시 알림(헤드업 알림)이 무조건 뜨도록 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // true: 로그인이 되어있다고 가정하여 홈 화면으로 이동
  // false: 로그인이 되어있지 않다고 가정하여 로그인 화면으로 이동
  const isLoggedIn = false;

  // 앱 실행 시 스마트폰 OS단에 알림 권한을 안전하게 받아오는 훅 연동
  useEffect(() => {
    async function requestNotificationPermissions() {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // 권한이 설정되어 있지 않은 최초 상태라면 기기에 권한 요청 팝업을 띄움
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // 만약 시연용 기기에서 사용자가 거부했을 경우 콘솔에 남김 (필요 시 Alert 유도 가능)
      if (finalStatus !== "granted") {
        console.log(
          "알림 권한이 거부되었습니다. 기기 설정에서 수동 허용이 필요할 수 있습니다.",
        );
      }
    }

    requestNotificationPermissions();
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // 로그인 되었을 때 보여줄 화면
          <Stack.Screen name="(tabs)" />
        ) : (
          // 로그인 안 되었을 때 보여줄 화면
          <Stack.Screen name="(auth)/login" />
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
