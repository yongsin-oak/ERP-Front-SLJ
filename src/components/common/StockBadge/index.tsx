import { useTheme, Theme } from "@emotion/react";
import styled from "@emotion/styled";
import { BORDER_RADIUS } from "../../../theme/constants";

const StyledStockBadge = styled.div<{
  status: "success" | "warning" | "error";
  theme: Theme;
}>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: ${BORDER_RADIUS.sm};
  font-size: 12px;
  font-weight: 600;

  ${(props) => {
    switch (props.status) {
      case "success":
        return `
          background: rgba(82, 196, 26, 0.1);
          color: #52c41a;
          border: 1px solid rgba(82, 196, 26, 0.2);
        `;
      case "warning":
        return `
          background: rgba(250, 173, 20, 0.1);
          color: #faad14;
          border: 1px solid rgba(250, 173, 20, 0.2);
        `;
      case "error":
        return `
          background: rgba(255, 77, 79, 0.1);
          color: #ff4d4f;
          border: 1px solid rgba(255, 77, 79, 0.2);
        `;
      default:
        return "";
    }
  }}
`;

interface StockBadgeProps {
  remaining: number;
  minStock?: number | null;
  children?: React.ReactNode;
  status?: "success" | "warning" | "error";
}

const StockBadge: React.FC<StockBadgeProps> = ({
  remaining,
  minStock,
  children,
  status,
}) => {
  const theme = useTheme();

  // Auto-determine status if not provided
  const getStatus = (): "success" | "warning" | "error" => {
    if (status) return status;

    if (remaining === 0) return "error";
    if (minStock && remaining <= minStock) return "warning";
    if (remaining < 10) return "warning";
    return "success";
  };

  const getDisplayText = () => {
    if (children) return children;

    if (remaining === 0) return "หมด";
    if (minStock && remaining <= minStock) return `${remaining} ชิ้น (ต่ำ)`;
    return `${remaining} ชิ้น`;
  };

  return (
    <StyledStockBadge status={getStatus()} theme={theme}>
      {getDisplayText()}
    </StyledStockBadge>
  );
};

export default StockBadge;
