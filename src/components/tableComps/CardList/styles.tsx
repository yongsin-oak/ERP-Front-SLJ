import styled from "@emotion/styled";
import { Theme } from "@emotion/react";
import { BORDER_RADIUS, SPACING } from "@theme/constants";

export const CardListContainer = styled.div<{ theme: Theme }>`
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

export const CardListHeader = styled.div<{ theme: Theme }>`
  padding: ${SPACING.lg} ${SPACING.lg} ${SPACING.md} ${SPACING.lg};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid ${(props) => props.theme.splitLine_};

  .item-title {
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

  .status-info {
    text-align: right;
    white-space: nowrap;
  }
`;

export const CardBody = styled.div<{ theme: Theme }>`
  padding: ${SPACING.lg};
`;

export const InfoRow = styled.div<{ theme: Theme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${SPACING.sm} 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${(props) => props.theme.splitLine_};
  }

  .value {
    &--price {
      color: ${(props) => props.theme.success_};
      font-weight: 700;
    }

    &--empty {
      color: ${(props) => props.theme.textTertiary_};
      font-style: italic;
    }
  }
`;

export const EmptyState = styled.div<{ theme: Theme }>`
  text-align: center;
  padding: 40px 20px;
  color: ${(props) => props.theme.textSecondary_};
  background: ${(props) => props.theme.backgroundSecondary_};
  border-radius: ${BORDER_RADIUS.lg};
  border: 2px dashed ${(props) => props.theme.splitLine_};
`;