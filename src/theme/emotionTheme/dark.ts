import type { Theme } from "@emotion/react";
import { red, green, orange, gray } from "../colors";

const emotionDark: Theme = {
  black100_: gray.black,
  white100_: gray.white,

  background_: gray.black,
  backgroundSecondary_: "#141414",
  backgroundElevated_: "#1f1f1f",
  backgroundBox_: "#1f1f1f",

  splitLine_: "rgba(255, 255, 255, 0.06)",

  textPrimary_: gray.white,
  textSecondary_: "rgba(255, 255, 255, 0.65)",
  textTertiary_: "rgba(255, 255, 255, 0.45)",
  textDisabled_: "rgba(255, 255, 255, 0.25)",

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

  border_: "rgba(255, 255, 255, 0.12)",
  hoverBackground_: "rgba(255, 255, 255, 0.08)",
  activeBackground_: "rgba(255, 255, 255, 0.16)",
  boxShadow_: "0 2px 8px rgba(0, 0, 0, 0.45)",
};

export default emotionDark;
