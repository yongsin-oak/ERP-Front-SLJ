import { Table as ATable, TableProps } from "antd";
import TableHeader from "../TableHeader";
import { useState } from "react";
import CardList from "../CardList";

export interface MTableProps extends TableProps {
  selectable?: boolean;
  onSelectionChange?: (
    selectedRowKeys: React.Key[],
    selectedRows: Record<string, unknown>[]
  ) => void;
  onShowSizeChange?: (current: number, size: number) => void;
  viewMode?: "card" | "table";
}

const MTable = ({
  selectable = false,
  onSelectionChange,
  onShowSizeChange,
  viewMode = "table",
  dataSource,
  pagination,
  ...props
}: MTableProps) => {
  const rowSelection = selectable
    ? {
        onChange: (
          selectedRowKeys: React.Key[],
          selectedRows: Record<string, unknown>[]
        ) => {
          onSelectionChange?.(selectedRowKeys, selectedRows);
        },
        ...props.rowSelection,
      }
    : undefined;
  const [defaultViewMode, setDefaultViewMode] = useState<"card" | "table">(
    viewMode
  );
  const handleViewModeChange = (mode: "card" | "table") => {
    setDefaultViewMode(mode);
  };
  return (
    <>
      <TableHeader
        viewMode={viewMode || defaultViewMode}
        setViewMode={handleViewModeChange}
      />
      {viewMode === "table" ? (
        <ATable
          rowSelection={rowSelection}
          dataSource={dataSource}
          pagination={{
            total: dataSource?.length || 0,
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
            pageSizeOptions: ["1", "2", "50", "100"],
            defaultPageSize: 10,
            onShowSizeChange(current, size) {
              onShowSizeChange?.(current, size);
            },
            responsive: true,
            ...pagination,
          }}
          {...props}
        />
      ) : (
        <CardList
          data={dataSource as any}
          selectable={selectable}
          onSelectItem={(id, checked) => {
            const selectedRowKeys = dataSource
              .filter((item: any) => item.selected)
              .map((item: any) => item.id);
            onSelectionChange?.(selectedRowKeys, dataSource);
          }}
        />
      )}
    </>
  );
};

export default MTable;
