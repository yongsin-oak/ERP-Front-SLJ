import { Button, ButtonProps } from "antd";
import { useTheme, Theme } from "@emotion/react";
import styled from "@emotion/styled";

const StyledButton = styled(Button)<{
  theme: Theme;
  fullWidth?: boolean;
  variant?: "solid" | "outlined" | "text";
}>`
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  width: ${({ fullWidth }) => (fullWidth ? "100%" : "fit-content")};

  /* Primary Button */
  &.ant-btn-primary {
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    border: none;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
      box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 6px rgba(24, 144, 255, 0.3);
    }
  }

  /* Default Button */
  &.ant-btn-default {
    border: 1px solid ${({ theme }) => theme.splitLine_};
    background: ${({ theme }) => theme.backgroundElevated_};
    color: ${({ theme }) => theme.textPrimary_};

    &:hover:not(:disabled) {
      border-color: #1890ff;
      color: #1890ff;
      background: ${({ theme }) => theme.hoverBackground_};
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
    }
  }

  /* Danger Button */
  &.ant-btn-dangerous {
    border-color: ${({ theme }) => theme.red100_};
    color: ${({ theme }) => theme.red100_};

    &.ant-btn-primary {
      background: linear-gradient(
        135deg,
        ${({ theme }) => theme.red100_} 0%,
        ${({ theme }) => theme.red200_} 100%
      );
      box-shadow: 0 2px 8px ${({ theme }) => theme.red100_}20;
    }

    &:hover:not(:disabled) {
      border-color: ${({ theme }) => theme.red200_};
      color: ${({ theme }) => theme.red200_};

      &.ant-btn-primary {
        background: linear-gradient(
          135deg,
          ${({ theme }) => theme.red200_} 0%,
          ${({ theme }) => theme.red300_} 100%
        );
        box-shadow: 0 4px 12px ${({ theme }) => theme.red100_}30;
      }
    }
  }

  /* Text Button */
  &.ant-btn-text {
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.textSecondary_};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.hoverBackground_};
      color: ${({ theme }) => theme.textPrimary_};
    }
  }

  /* Size Variants */
  &.ant-btn-sm {
    height: 32px;
    padding: 0 12px;
    font-size: 13px;
  }

  &.ant-btn-lg {
    height: 48px;
    padding: 0 24px;
    font-size: 16px;
    border-radius: 10px;
  }

  /* Disabled State */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  /* Loading State */
  &.ant-btn-loading {
    pointer-events: none;

    .ant-btn-loading-icon {
      margin-right: 8px;
    }
  }

  /* Icon Buttons */
  &.ant-btn-icon-only {
    width: auto;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    &.ant-btn-lg {
      height: 44px;
      font-size: 15px;
    }

    &.ant-btn {
      height: 36px;
      font-size: 14px;
    }
  }
`;

export interface MButtonProps extends ButtonProps {
  children?: React.ReactNode;
  fullWidth?: boolean;
  variant?: "solid" | "outlined" | "text";
}

const MButton = ({
  children,
  fullWidth,
  type = "default",
  variant = "solid",
  ...props
}: MButtonProps) => {
  const theme = useTheme();

  return (
    <StyledButton
      theme={theme}
      fullWidth={fullWidth}
      variant={variant}
      type={type}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default MButton;
