import styled from "@emotion/styled";

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

export const SearchContainer = styled.div`
  margin-bottom: 16px;

  .ant-input-search {
    max-width: 400px;

    @media (max-width: 768px) {
      max-width: 100%;
    }
  }
`;
