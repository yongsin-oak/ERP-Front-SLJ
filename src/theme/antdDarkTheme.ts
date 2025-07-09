import { theme as antdDarkTheme } from "antd";
import type { ThemeConfig } from "antd/es/config-provider/context";

const red = {
  primary: "#e0282e",
  hover: "#c1252a",
  active: "#a71f23",
};

export const customDarkAntdTheme: ThemeConfig = {
  algorithm: antdDarkTheme.darkAlgorithm, // ใช้ฐาน dark mode ของ AntD
  token: {
    colorPrimary: red.primary,
    colorInfo: red.primary,
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",

    colorLink: red.hover,
    colorTextBase: "#ffffff",
    colorBgBase: "#000000",
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
      siderBg: "#000000",
      triggerBg: "#1f1f1f",
    },
    Menu: {
      darkItemBg: "#000000",
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
      colorText: "#fff",
    },
    Input: {
      colorBgContainer: "#1f1f1f",
      colorText: "#fff",
      colorTextPlaceholder: "rgba(255,255,255,0.35)",
    },
  },
};
