import emotionLight from "./emotionTheme/light";
import emotionDark from "./emotionTheme/dark";
import { darkAntdTheme } from "./antdTheme/dark";
import { lightAntdTheme } from "./antdTheme/light";

export const themes = {
  light: {
    emotion: emotionLight,
    antd: lightAntdTheme,
  },
  dark: {
    emotion: emotionDark,
    antd: darkAntdTheme,
  },
};

// Export style constants
export * from "./constants";
