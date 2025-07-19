import React from "react";
import { useTheme } from "@emotion/react";
import { StatusBadgeContainer } from "./styles";
import Text from "../Text";

export interface StatusBadgeProps {
  value: number;
  minValue?: number;
  label?: string;
  variant?: "default" | "custom";
  customRender?: (status: {
    value: number;
    minValue?: number;
    label?: string;
  }) => React.ReactNode;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  value,
  minValue,
  label,
  variant = "default",
  customRender,
}) => {
  const theme = useTheme();

  if (variant === "custom" && customRender) {
    return <>{customRender({ value, minValue, label })}</>;
  }

  const getStatusType = () => {
    if (value === 0) return "error";
    if (minValue && value <= minValue) return "warning";
    if (value < 10) return "warning";
    return "success";
  };

  const getStatusText = () => {
    if (value === 0) return "หมด";
    if (minValue && value <= minValue) return `${value} ${label} (ต่ำ)`;
    return `${value} ${label}`;
  };

  const getTextColor = () => {
    switch (getStatusType()) {
      case "success":
        return theme.success_;
      case "warning":
        return theme.warning_;
      case "error":
        return theme.error_;
      default:
        return theme.textPrimary_;
    }
  };

  return (
    <StatusBadgeContainer status={getStatusType()} theme={theme}>
      <Text s2 color={getTextColor()}>
      {getStatusText()}
      </Text>
    </StatusBadgeContainer>
  );
};

export default StatusBadge;
