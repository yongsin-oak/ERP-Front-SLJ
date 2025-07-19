import { Theme } from "@emotion/react";
import styled from "@emotion/styled";
import { BORDER_RADIUS, SPACING } from "@theme/constants";

export const StatusBadgeContainer = styled.div<{
  status: "success" | "warning" | "error";
  theme: Theme;
}>`
  display: inline-flex;
  align-items: center;
  gap: ${SPACING.sm};
  padding: ${SPACING.xs} ${SPACING.sm};
  border-radius: ${BORDER_RADIUS.sm};

  ${({ theme, status }) => {
    switch (status) {
      case "success":
        return `
          background: ${theme.successBackground_};
          color: ${theme.success_};
          border: ${theme.successBorder_} solid 1px;
          
        `;
      case "warning":
        return `
          background: ${theme.warningBackground_};
          color: ${theme.warning_};
          border: ${theme.warningBorder_} solid 1px;
        `;
      case "error":
        return `
          background: ${theme.errorBackground_};
          color: ${theme.error_};
          border: ${theme.errorBorder_} solid 1px;
        `;
      default:
        return "";
    }
  }}
`;
