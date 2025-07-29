import { highlightText } from "@utils/highlightText";
import { Table as ATable, Input, TableProps } from "antd";
import { ColumnsType, ColumnType } from "antd/es/table";
import { useState } from "react";
import CardList from "../CardList";
import TableHeader from "../TableHeader";

export interface MTableProps<T> extends TableProps<T> {
  // ===== Required Props =====
  columns: ColumnsType<T>;
  dataSource: T[];
  tableName?: string; // ชื่อตาราง

  // ===== Basic Configuration =====
  rowKey: string; // default: "id"
  titleColumn: string; // default: "name"
  columnsShow?: string[];

  // ===== Features =====
  selectable?: boolean; // เลือกได้หรือไม่
  showViewToggle?: boolean; // สลับ table/card view (default: true)

  // ===== Actions =====
  onSelectionChange?: (selectedRows: T[]) => void;

  // ===== Advanced (optional) =====
  viewMode?: "card" | "table"; // force view mode
  pageSize?: number;
  // ===== Legacy Props (for backward compatibility) =====
  onShowSizeChange?: (current: number, size: number) => void;
  totalItems?: number;
  search?: {
    searchTerm?: string;
    searchKey?: string[];
  };
}

function MTable<T extends object>({
  // ====< New simplified props =====
  tableName = "ข้อมูล",
  rowKey = "id",
  selectable = false,
  showViewToggle = true,
  onSelectionChange,
  pageSize = 10,
  loading,
  columnsShow = [], // คอลัมน์ที่จะแสดงใน CardList
  titleColumn,

  // ===== Legacy props =====
  onShowSizeChange,
  viewMode,
  totalItems,
  search = {},

  // ===== Required props =====
  columns = [],
  dataSource = [],
  ...props
}: MTableProps<T>) {
  const [defaultViewMode, setDefaultViewMode] = useState<"card" | "table">(
    viewMode || "table"
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchTerm, setSearchTerm] = useState(search?.searchTerm || "");

  const rowSelection = selectable
    ? {
        selectedRowKeys,
        onChange: (selectedKeys: React.Key[], selectedRows: T[]) => {
          setSelectedRowKeys(selectedKeys);
          // Handle both new and legacy callback formats
          if (onSelectionChange) {
            onSelectionChange(selectedRows);
          }
        },
      }
    : undefined;

  const handleViewModeChange = (mode: "card" | "table") => {
    console.log("Changing view mode to:", mode);
    setDefaultViewMode(mode);
  };

  const renderColumns = columns.map((col: ColumnType<T>) => ({
    ...col,
    render(value: unknown, record: T, index: number) {
      const searchTermToUse = search?.searchTerm || searchTerm;
      return searchTermToUse &&
        search?.searchKey?.includes(col.dataIndex as string)
        ? highlightText(String(value || ""), searchTermToUse)
        : col.render?.(value, record, index) || value;
    },
  }));

  return (
    <>
      {!viewMode && (
        <TableHeader
          viewMode={defaultViewMode}
          setViewMode={handleViewModeChange}
          tableName={tableName}
          totalItems={totalItems || dataSource?.length}
          showViewToggle={showViewToggle}
        />
      )}
      {defaultViewMode === "table" ? (
        <ATable<T>
          title={() => {
            return <Input.Search placeholder="ค้นหาข้อมูล" />;
          }}
          rowSelection={rowSelection}
          dataSource={dataSource}
          columns={renderColumns as ColumnType<T>[]}
          rowKey={rowKey}
          loading={loading}
          pagination={{
            total: dataSource?.length,
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
            pageSizeOptions: ["10", "20", "50", "100"],
            defaultPageSize: pageSize,
            onShowSizeChange(current, size) {
              onShowSizeChange?.(current, size);
            },
            responsive: true,
          }}
          {...props}
        />
      ) : (
        <CardList
          dataSource={dataSource}
          columns={columns}
          columnsShow={columnsShow} // หรือให้ config ผ่าน props
          titleColumn={titleColumn}
          rowKey={rowKey}
          subtitleColumn="barcode"
          selectedItems={selectedRowKeys}
          searchTerm={searchTerm}
          onSelectItem={(id, checked) => {
            const newKeys = checked
              ? [...selectedRowKeys, id]
              : selectedRowKeys.filter((key) => key !== id);
            setSelectedRowKeys(newKeys);
            const selectedRows = dataSource.filter((d: T) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              newKeys.includes((d as any)[rowKey])
            );
            onSelectionChange?.(selectedRows);
          }}
        />
      )}
    </>
  );
}

export default MTable;
