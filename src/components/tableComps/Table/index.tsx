import { Table as ATable, TableProps } from "antd";
import { useTheme, Theme } from "@emotion/react";
import styled from "@emotion/styled";

const StyledTable = styled(ATable)<{ theme: Theme }>`
  .ant-table {
    background: ${({ theme }) => theme.backgroundElevated_};
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.splitLine_};
    overflow: hidden;
  }

  .ant-table-thead > tr > th {
    background: ${({ theme }) => theme.backgroundSecondary_};
    border-bottom: 1px solid ${({ theme }) => theme.splitLine_};
    color: ${({ theme }) => theme.textPrimary_};
    font-weight: 600;
    padding: 16px;
  }

  .ant-table-tbody > tr > td {
    border-bottom: 1px solid ${({ theme }) => theme.splitLine_};
    padding: 16px;
    color: ${({ theme }) => theme.textPrimary_};
  }

  .ant-table-tbody > tr:hover > td {
    background: ${({ theme }) => theme.hoverBackground_};
  }

  .ant-table-tbody > tr:last-child > td {
    border-bottom: none;
  }

  .ant-pagination {
    margin-top: 24px;
    text-align: center;
  }

  .ant-pagination-item {
    border: 1px solid ${({ theme }) => theme.splitLine_};
    background: ${({ theme }) => theme.backgroundElevated_};
  }

  .ant-pagination-item:hover {
    border-color: ${({ theme }) => theme.textSecondary_};
  }

  .ant-pagination-item-active {
    border-color: #1890ff;
    background: #1890ff;
  }

  .ant-pagination-item-active a {
    color: white;
  }

  @media (max-width: 768px) {
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 12px 8px;
      font-size: 14px;
    }

    .ant-table {
      font-size: 14px;
    }
  }
`;

interface Props extends TableProps {
  limit?: number;
  total?: number;
  jumper?: boolean;
  responsive?: boolean;
}

const Table = ({
  limit = 10,
  total,
  jumper = true,
  responsive = true,
  scroll = { x: 800 },
  ...props
}: Props) => {
  const theme = useTheme();

  const paginationConfig = {
    pageSize: limit,
    total: total,
    showQuickJumper: jumper,
    showSizeChanger: true,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} จาก ${total} รายการ`,
    pageSizeOptions: ["10", "20", "50", "100"],
  };

  return (
    <StyledTable
      theme={theme}
      pagination={paginationConfig}
      scroll={responsive ? scroll : undefined}
      {...(props as TableProps<unknown>)}
    />
  );
};

export default Table;
