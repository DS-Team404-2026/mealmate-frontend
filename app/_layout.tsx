import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // true: 로그인이 되어있다고 가정하여 홈 화면으로 이동
  // false: 로그인이 되어있지 않다고 가정하여 로그인 화면으로 이동
  const isLoggedIn = false;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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