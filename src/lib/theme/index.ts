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

export * from "./antdTheme/dark";
export * from "./antdTheme/light";
export * from "./emotionTheme/dark";
export * from "./emotionTheme/light";
export * from "./colors";
export * from "./constants";
export * from "./emotion";
export { useStoreTheme } from "./theme";
