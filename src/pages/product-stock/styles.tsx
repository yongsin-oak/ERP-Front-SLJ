import styled from "@emotion/styled";
import { Theme } from "@emotion/react";
import { BORDER_RADIUS, SPACING } from "../../theme/constants";

export const ProductStockContainer = styled.div<{ theme: Theme }>`
  /* Table styles - moved to Table component */
  .ant-table-wrapper {
    border-radius: ${BORDER_RADIUS.lg};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid ${(props) => props.theme.splitLine_};
    overflow: hidden;

    .ant-table-thead > tr > th {
      background: ${(props) => props.theme.backgroundSecondary_};
      font-weight: 600;
      border-bottom: 2px solid ${(props) => props.theme.splitLine_};
      color: ${(props) => props.theme.textPrimary_};
      padding: ${SPACING.md} ${SPACING.lg};
      font-size: 14px;

      &:hover {
        background: ${(props) => props.theme.backgroundSecondary_} !important;
      }
    }

    .ant-table-tbody > tr > td {
      border-bottom: 1px solid ${(props) => props.theme.splitLine_};
      padding: ${SPACING.md} ${SPACING.lg};
      font-size: 14px;

      &:first-of-type {
        font-weight: 500;
      }
    }

    .ant-table-tbody > tr:hover > td {
      background: ${(props) => props.theme.hoverBackground_};
    }

    /* Enhanced row hover effect */
    .ant-table-tbody > tr {
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }

    /* Action button enhancements */
    .ant-btn {
      &:hover {
        transform: scale(1.1);
        transition: transform 0.2s ease;
      }
    }

    /* Pagination improvements */
    .ant-pagination {
      padding: ${SPACING.lg};
      margin: 0;

      .ant-pagination-item,
      .ant-pagination-prev,
      .ant-pagination-next,
      .ant-pagination-jump-prev,
      .ant-pagination-jump-next {
        margin: 0 ${SPACING.xs};
      }

      .ant-pagination-options {
        margin-left: ${SPACING.md};
      }
    }
  }
`;

// Keep only Product Details styles for the drawer since it's specific to this page
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
