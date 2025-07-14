import React from "react";
import { useTheme, Theme } from "@emotion/react";
import styled from "@emotion/styled";
import { BORDER_RADIUS, SPACING } from "../../../theme/constants";

const StyledInfoRow = styled.div<{ theme: Theme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${SPACING.sm} 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${(props) => props.theme.splitLine_};
  }

  .label {
    color: ${(props) => props.theme.textSecondary_};
    font-size: 13px;
    font-weight: 500;
  }

  .value {
    font-weight: 600;
    color: ${(props) => props.theme.textPrimary_};

    &--price {
      color: #52c41a;
      font-weight: 700;
    }

    &--empty {
      color: ${(props) => props.theme.textTertiary_};
      font-style: italic;
    }

    &--code {
      font-family: "Courier New", monospace;
      background: ${(props) => props.theme.backgroundSecondary_};
      padding: 2px 6px;
      border-radius: ${BORDER_RADIUS.xs};
      font-size: 12px;
    }
  }
`;

interface InfoRowProps {
  label: string;
  value?: React.ReactNode;
  valueType?: "default" | "price" | "empty" | "code";
  className?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  valueType = "default",
  className,
}) => {
  const theme = useTheme();

  const getValueClassName = () => {
    switch (valueType) {
      case "price":
        return "value value--price";
      case "empty":
        return "value value--empty";
      case "code":
        return "value value--code";
      default:
        return "value";
    }
  };

  return (
    <StyledInfoRow theme={theme} className={className}>
      <span className="label">{label}</span>
      <span className={getValueClassName()}>{value || "-"}</span>
    </StyledInfoRow>
  );
};

export default InfoRow;
