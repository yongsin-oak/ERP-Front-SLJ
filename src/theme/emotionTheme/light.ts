import type { Theme } from "@emotion/react";
import { red, green, orange, gray } from "../colors";

const lightTheme: Theme = {
  black100_: gray.black,
  white100_: gray.white,

  background_: "#ffffff",
  backgroundSecondary_: "#f5f5f5",
  backgroundElevated_: "#ffffff",
  backgroundBox_: "#ffffff",

  splitLine_: "rgba(5, 5, 5, 0.06)",

  textPrimary_: "rgba(0,0,0,0.88)",
  textSecondary_: "rgba(0,0,0,0.65)",
  textTertiary_: "rgba(0,0,0,0.45)",
  textDisabled_: "rgba(0,0,0,0.25)",

  red100_: red.primary,
  red200_: red.hover,
  error_: red.error,
  errorBackground_: red.errorBackground,
  errorBorder_: red.errorBorder,

  success_: green.success,
  successBackground_: green.successBackground,
  successBorder_: green.successBorder,
  
  warning_: orange.warning,
  warningBackground_: orange.warningBackground,
  warningBorder_: orange.warningBorder,

  border_: "rgba(0,0,0,0.12)",
  hoverBackground_: "rgba(0,0,0,0.04)",
  activeBackground_: "rgba(0,0,0,0.08)",
  boxShadow_: "0 2px 8px rgba(0, 0, 0, 0.15)",
};

export default lightTheme;
