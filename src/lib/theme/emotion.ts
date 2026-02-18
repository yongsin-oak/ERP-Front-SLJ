import "@emotion/react";

declare module "@emotion/react" {
  export interface Theme {
    black100_: string;
    white100_: string;
    background_: string;
    backgroundSecondary_?: string; // ใส่ถ้ามี
    backgroundElevated_?: string;
    backgroundBox_?: string;
    splitLine_: string;
    textPrimary_: string;
    textSecondary_?: string;
    textTertiary_?: string;
    textDisabled_?: string;

    red100_: string;
    red200_: string;
    error_: string;
    errorBackground_: string;
    errorBorder_: string;

    success_: string;
    successBackground_: string;
    successBorder_: string;

    warning_: string;
    warningBackground_: string;
    warningBorder_: string;

    border_: string;
    hoverBackground_?: string;
    activeBackground_?: string;
    boxShadow_?: string;
  }
}
