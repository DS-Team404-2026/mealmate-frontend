/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Brand Colors
const primary = '#417D7A';
const primaryDark = '#414D4C';
const primaryDeep = '#315E5B';

export const Colors = {
  light: {
    // Base
    text: '#11181C',
    background: '#fff',

    // Brand
    primary,
    primaryDark,
    primaryDeep,

    // UI
    tint: primary,
    icon: '#687076',

    // Tab
    tabIconDefault: '#687076',
    tabIconSelected: primary,
  },

  dark: {
    // Base
    text: '#ECEDEE',
    background: '#151718',

    // Brand
    primary,
    primaryDark,
    primaryDeep,

    // UI
    tint: '#fff',
    icon: '#9BA1A6',

    // Tab
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',

    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',

    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',

    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },

  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },

  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",

    serif: "Georgia, 'Times New Roman', serif",

    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",

    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});