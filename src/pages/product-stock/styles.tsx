import styled from "@emotion/styled";
import { Theme } from "@emotion/react";
import { BORDER_RADIUS, SPACING } from "../../theme/constants";
export const ViewControls = styled.div<{ theme: Theme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.md};

  .left-controls {
    display: flex;
    align-items: center;
    gap: ${SPACING.sm};
  }

  .right-controls {
    display: flex;
    align-items: center;
    gap: ${SPACING.xs};
  }

  @media (max-width: 768px) {
    .right-controls {
      display: none;
    }
  }
`;

export const MobileControls = styled.div<{ theme: Theme }>`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${(props) => props.theme.background_};
  padding: ${SPACING.sm} 0;
  margin-bottom: ${SPACING.md};
  border-bottom: 1px solid ${(props) => props.theme.splitLine_};

  @media (max-width: 768px) {
    position: static;
    border-bottom: none;
    margin-bottom: ${SPACING.sm};
  }
`;

export const ProductCard = styled.div<{ theme: Theme }>`
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  border: 1px solid ${(props) => props.theme.splitLine_};
  background: ${(props) => props.theme.backgroundElevated_};
  overflow: hidden;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

    &:hover {
      transform: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    }
  }
`;

export const ProductCardHeader = styled.div<{ theme: Theme }>`
  padding: ${SPACING.lg} ${SPACING.lg} ${SPACING.md} ${SPACING.lg};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid ${(props) => props.theme.splitLine_};

  .product-title {
    flex: 1;
    margin-right: ${SPACING.md};

    h6 {
      margin: 0;
      line-height: 1.3;
      color: ${(props) => props.theme.textPrimary_};
    }

    .barcode {
      margin-top: ${SPACING.xs};
      font-family: "Courier New", monospace;
      background: ${(props) => props.theme.backgroundSecondary_};
      padding: ${SPACING.xs} ${SPACING.sm};
      border-radius: ${BORDER_RADIUS.sm};
      font-size: 11px;
      color: ${(props) => props.theme.textSecondary_};
      display: inline-block;
    }
  }

  .stock-info {
    text-align: right;
    white-space: nowrap;
  }
`;

export const ProductCardBody = styled.div<{ theme: Theme }>`
  padding: ${SPACING.lg};
`;

export const InfoRow = styled.div<{ theme: Theme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${SPACING.sm} 0;

  border-bottom: 1px solid ${(props) => props.theme.splitLine_};

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

export const StockBadge = styled.div<{
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

export const EmptyState = styled.div<{ theme: Theme }>`
  text-align: center;
  padding: 40px 20px;
  color: ${(props) => props.theme.textSecondary_};
  background: ${(props) => props.theme.backgroundSecondary_};
  border-radius: ${BORDER_RADIUS.lg};
  border: 2px dashed ${(props) => props.theme.splitLine_};
`;

export const ProductDetails = styled.div<{ theme: Theme }>`
  .product-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: ${SPACING.lg};
    margin: -${SPACING.lg} -${SPACING.lg} ${SPACING.lg} -${SPACING.lg};
    background: ${(props) => props.theme.backgroundSecondary_};
    border-bottom: 1px solid ${(props) => props.theme.splitLine_};

    .product-title {
      flex: 1;
      margin-right: ${SPACING.md};

      .barcode {
        margin-top: ${SPACING.xs};
        font-family: "Courier New", monospace;
        background: ${(props) => props.theme.background_};
        padding: ${SPACING.xs} ${SPACING.sm};
        border-radius: ${BORDER_RADIUS.sm};
        font-size: 12px;
        color: ${(props) => props.theme.textSecondary_};
        display: inline-block;
      }
    }

    .stock-badge {
      flex-shrink: 0;
    }
  }

  .info-section {
    margin-bottom: ${SPACING.xl};

    &:last-child {
      margin-bottom: 0;
    }

    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: ${SPACING.md};
      padding-bottom: ${SPACING.sm};
      border-bottom: 2px solid ${(props) => props.theme.splitLine_};
      color: ${(props) => props.theme.textPrimary_};
    }

    .info-grid {
      display: flex;
      flex-direction: column;
      gap: ${SPACING.xs};
    }
  }
`;

export const DrawerActions = styled.div<{ theme: Theme }>`
  display: flex;
  gap: ${SPACING.md};
  padding: ${SPACING.lg} 0;
  border-top: 1px solid ${(props) => props.theme.splitLine_};
  margin-top: ${SPACING.xl};

  button {
    flex: 1;
  }
`;
