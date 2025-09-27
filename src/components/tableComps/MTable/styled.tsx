import styled from "@emotion/styled";
import { Card } from "antd";

// Styled Components
export const TableContainer = styled.div`
  width: 100%;
  .ant-table-wrapper {
    .ant-table-thead > tr > th {
      background: #fafafa;
      font-weight: 600;
    }
  }
`;

export const ViewToggleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .view-toggle {
    display: flex;
    gap: 8px;
  }

  .table-info {
    display: flex;
    align-items: center;
    gap: 16px;

    h4 {
      margin: 0;
    }

    .total-count {
      color: #666;
      font-size: 14px;
    }
  }
`;

export const CardContainer = styled(Card)`
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .ant-card-body {
    padding: 16px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;

    .card-title {
      flex: 1;
      margin-left: 12px;

      .title {
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 4px;
        color: #262626;
      }

      .subtitle {
        color: #8c8c8c;
        font-size: 14px;
      }
    }

    .card-actions {
      display: flex;
      gap: 8px;
    }
  }

  .card-content {
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .label {
        color: #8c8c8c;
        font-size: 14px;
        flex: 1;
      }

      .value {
        font-weight: 500;
        text-align: right;
        color: #262626;

        &.empty {
          color: #bfbfbf;
          font-style: italic;
        }
      }
    }
  }

  .additional-info {
    margin-top: 8px;

    .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-header {
      padding: 8px 0;
      color: #1890ff;
      font-size: 14px;
    }

    .ant-collapse-ghost
      > .ant-collapse-item
      > .ant-collapse-content
      > .ant-collapse-content-box {
      padding: 8px 0 0 0;
    }
  }
`;

export const SearchContainer = styled.div`
  margin-bottom: 16px;

  .ant-input-search {
    max-width: 400px;

    @media (max-width: 768px) {
      max-width: 100%;
    }
  }
`;

export const EmptyStateContainer = styled.div`
  text-align: center;
  padding: 48px 0;
  color: #8c8c8c;
`;
