import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const currentTheme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  // 기기 하단 내비게이션 바 공간을 고려한 동적 높이 설정
  const BASE_HEIGHT = 62;
  const TAB_BAR_HEIGHT = BASE_HEIGHT + insets.bottom;

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: currentTheme.tabIconSelected,
        tabBarInactiveTintColor: currentTheme.tabIconDefault,
        tabBarStyle: [
          styles.tabBar,
          { 
            backgroundColor: currentTheme.background,
            borderTopColor: colorScheme === 'dark' ? '#26292A' : '#E0E0E0',
            height: TAB_BAR_HEIGHT,
            paddingBottom: insets.bottom + 6, // 텍스트 라벨이 하단 내비바와 겹치지 않게 패딩 조정
          }
        ],
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? 'heart' : 'heart-outline'} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          // 아이콘 컨테이너 내부의 레이아웃 왜곡을 막기 위해 상위 스타일 오버라이드
          tabBarIconStyle: styles.scanIconWrapper,
          tabBarIcon: ({ focused }) => (
            <View 
              style={[
                styles.scanButtonContainer, 
                { 
                  backgroundColor: colorScheme === 'dark' ? '#1F2223' : '#F5F5F5',
                },
                focused && (colorScheme === 'dark' ? styles.scanButtonActiveDark : styles.scanButtonActiveLight)
              ]}
            >
              <Ionicons 
                size={26} 
                name="barcode-outline" 
                color={focused ? currentTheme.tabIconSelected : currentTheme.tabIconDefault} 
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? 'cart' : 'cart-outline'} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? 'settings' : 'settings-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 1,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  // Scan 스크린 아이콘 전용 기본 컴포넌트 마진 취소
  scanIconWrapper: {
    overflow: 'visible',
    zIndex: 10,
  },
  scanButtonContainer: {
    // 완전한 독립 배치를 위해 기존 탭 영역 내에서 중앙 배치 가이드 변경
    transform: [{ translateY: -16 }], 
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  scanButtonActiveLight: {
    backgroundColor: '#EAEAEA',
  },
  scanButtonActiveDark: {
    backgroundColor: '#2A2E30',
  },
});