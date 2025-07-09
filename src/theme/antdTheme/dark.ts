import { theme as antdDarkTheme } from "antd";
import type { ThemeConfig } from "antd/es/config-provider/context";
import { green, orange, red, gray } from "../colors";

export const darkAntdTheme: ThemeConfig = {
  algorithm: antdDarkTheme.darkAlgorithm,
  token: {
    colorPrimary: red.primary,
    colorInfo: red.primary,
    colorSuccess: green.primary,
    colorWarning: orange.primary,
    colorError: "#ff4d4f",

    colorLink: red.hover,
    colorTextBase: gray.white,
    colorBgBase: gray.black,
    colorBorder: "rgba(255, 255, 255, 0.12)",
    borderRadius: 6,
    fontSize: 14,
  },
  components: {
    Button: {
      colorPrimary: red.primary,
      colorPrimaryHover: red.hover,
      colorPrimaryActive: red.active,
      borderRadius: 6,
    },
    Layout: {
      siderBg: gray.black,
      triggerBg: "#1f1f1f",
    },
    Menu: {
      darkItemBg: gray.black,
      darkPopupBg: "#1f1f1f",
      darkSubMenuItemBg: "#1f1f1f",
      itemHoverBg: "rgba(255,255,255,0.08)",
      itemSelectedBg: red.active,
    },
    Card: {
      colorBgContainer: "#141414",
      borderRadius: 12,
    },
    Modal: {
      colorBgBase: "#1f1f1f",
      borderRadiusLG: 12,
    },
    Tooltip: {
      colorText: gray.white,
    },
    Input: {
      colorBgContainer: "#1f1f1f",
      colorText: gray.white,
      colorTextPlaceholder: "rgba(255,255,255,0.35)",
    },
  },
};
