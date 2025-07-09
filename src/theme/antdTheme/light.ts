import { theme as antdLight } from "antd";
import type { ThemeConfig } from "antd/es/config-provider/context";
import { green, orange, red } from "../colors";

export const lightAntdTheme: ThemeConfig = {
  algorithm: antdLight.defaultAlgorithm,
  token: {
    colorPrimary: red.primary,
    colorInfo: red.primary,
    colorSuccess: green.primary,
    colorWarning: orange.primary,
    colorError: "#ff4d4f",
    colorLink: red.hover,

    colorTextBase: "rgba(0, 0, 0, 0.88)",
    colorBgBase: "#ffffff",
    colorBorder: "rgba(0, 0, 0, 0.12)",
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
      siderBg: "#ffffff",
      triggerBg: "#f5f5f5",
    },
    Menu: {
      itemBg: "#ffffff",
      itemHoverBg: "rgba(0,0,0,0.04)",
      itemSelectedBg: "#fff1f0",
    },
    Card: {
      colorBgContainer: "#ffffff",
      borderRadius: 12,
    },
    Modal: {
      colorBgBase: "#ffffff",
      borderRadiusLG: 12,
    },
    Input: {
      colorBgContainer: "#ffffff",
      colorText: "rgba(0, 0, 0, 0.88)",
      colorTextPlaceholder: "rgba(0, 0, 0, 0.45)",
    },
    Tooltip: {
      colorText: "#fff",
    },
  },
};
