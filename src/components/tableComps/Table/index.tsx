import { Table as ATable, TableProps } from "antd";
import TableHeader from "../TableHeader";
import { useState } from "react";
import CardList, { CardItem } from "../CardList";
import { highlightText } from "@utils/highlightText";
import { AnyObject } from "antd/es/_util/type";
import { ColumnsType, ColumnType } from "antd/es/table";

export interface MTableProps extends TableProps {
  selectable?: boolean;
  onSelectionChange?: (
    selectedRowKeys: React.Key[],
    selectedRows: Record<string, unknown>[]
  ) => void;
  onShowSizeChange?: (current: number, size: number) => void;
  viewMode?: "card" | "table";
  // Props สำหรับ TableHeader
  tableName?: string;
  totalItems?: number;
  showViewToggle?: boolean;
  search?: {
    searchTerm?: string;
    searchKey?: string[];
  };
  onEditItem?: (item: CardItem) => void;
  onDeleteItem?: (item: CardItem) => void;
  // Props สำหรับ CardList
  cardProps?: {
    emptyStateMessage?: string;
    additionalDetailsLabel?: string;
    renderStatusBadge?: (status: CardItem["status"]) => React.ReactNode;
    // Function to transform table data to card data
    transformData?: (data: any[]) => CardItem[];
  };
}

const MTable = ({
  selectable = false,
  onSelectionChange,
  onShowSizeChange,
  viewMode,
  dataSource = [],
  pagination,
  tableName = "ตาราง",
  totalItems,
  showViewToggle = true,
  cardProps,
  search = {},
  columns = [],
  onEditItem,
  onDeleteItem,
  ...props
}: MTableProps) => {
  const [defaultViewMode, setDefaultViewMode] = useState<"card" | "table">(
    viewMode || "table"
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const currentViewMode = viewMode || defaultViewMode;

  const rowSelection = selectable
    ? {
        selectedRowKeys,
        onChange: (
          selectedKeys: React.Key[],
          selectedRows: Record<string, unknown>[]
        ) => {
          setSelectedRowKeys(selectedKeys);
          onSelectionChange?.(selectedKeys, selectedRows);
        },
        ...props.rowSelection,
      }
    : undefined;

  const handleViewModeChange = (mode: "card" | "table") => {
    console.log("Changing view mode to:", mode);
    setDefaultViewMode(mode);
  };

  // Transform table data to card data
  const getCardData = (): CardItem[] => {
    if (cardProps?.transformData) {
      return cardProps.transformData(dataSource);
    }

    // Default transformation (basic mapping)
    return dataSource.map((item: any, index: number) => ({
      id: item.key || item.id || index,
      title: item.name || item.title || `รายการ ${index + 1}`,
      subtitle: item.code || item.subtitle,
      status: item.status,
      mainFields: Object.entries(item)
        .filter(
          ([key]) =>
            ![
              "key",
              "id",
              "name",
              "title",
              "code",
              "subtitle",
              "status",
            ].includes(key)
        )
        .slice(0, 4) // แสดงแค่ 4 fields หลัก
        .map(([key, value]) => ({
          label: key,
          value: value as string | number | null,
          type: typeof value === "number" ? "number" : "text",
        })),
      additionalFields: Object.entries(item)
        .filter(
          ([key]) =>
            ![
              "key",
              "id",
              "name",
              "title",
              "code",
              "subtitle",
              "status",
            ].includes(key)
        )
        .slice(4) // fields เพิ่มเติม
        .map(([key, value]) => ({
          label: key,
          value: value as string | number | null,
          type: typeof value === "number" ? "number" : "text",
        })),
    }));
  };

  const handleCardSelectItem = (id: string | number, checked: boolean) => {
    let newSelectedKeys: React.Key[];

    if (checked) {
      newSelectedKeys = [...selectedRowKeys, id];
    } else {
      newSelectedKeys = selectedRowKeys.filter((key) => key !== id);
    }

    setSelectedRowKeys(newSelectedKeys);

    // Find selected rows
    const selectedRows = dataSource.filter((item: any) =>
      newSelectedKeys.includes(item.key || item.id)
    );

    onSelectionChange?.(newSelectedKeys, selectedRows);
  };

  // Import necessary types at the top

  const renderColumns: ColumnsType<AnyObject> = columns.map(
    (col: ColumnType<AnyObject>) => ({
      ...col,
      render(value: any, record: AnyObject, index: number) {
        return search?.searchTerm &&
          search?.searchKey?.includes(col.dataIndex as string)
          ? highlightText(value, search.searchTerm)
          : col.render?.(value, record, index) || value;
      },
    })
  );
  return (
    <>
      {!viewMode && (
        <TableHeader
          viewMode={currentViewMode}
          setViewMode={handleViewModeChange}
          tableName={tableName}
          totalItems={totalItems || dataSource.length}
          showViewToggle={showViewToggle}
        />
      )}

      {currentViewMode === "table" ? (
        <ATable
          rowSelection={rowSelection}
          dataSource={dataSource}
          columns={renderColumns}
          pagination={{
            total: dataSource.length,
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
            pageSizeOptions: ["10", "20", "50", "100"],
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
          data={getCardData()}
          selectedItems={selectedRowKeys}
          selectable={selectable}
          onSelectItem={handleCardSelectItem}
          searchTerm={search.searchTerm}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
          emptyStateMessage={cardProps?.emptyStateMessage}
          additionalDetailsLabel={cardProps?.additionalDetailsLabel}
          renderStatusBadge={cardProps?.renderStatusBadge}
        />
      )}
    </>
  );
};

export default MTable;
