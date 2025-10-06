import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Table as AntTable,
  Button,
  Input,
  Space,
  Tooltip,
  Typography,
  Modal,
} from "antd";
import { get } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import DetailDrawer from "./DetailDrawer";
import { MTableProps } from "./interface";
import { SearchContainer, TableContainer, ViewToggleContainer } from "./styled";

// Utility function to highlight search text
const highlightText = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} style={{ backgroundColor: "#fff2b8", padding: 0 }}>
        {part}
      </mark>
    ) : (
      part
    )
  );
};

function MTable<T extends object>({
  // Confirm delete state
  // Required
  columns,
  dataSource = [],
  rowKey,

  // Display
  tableName = "ข้อมูล",
  titleColumn = "name",
  subtitleColumn,
  columnsShow = [],
  columnsAdditional = [],

  // Features
  selectable = false,
  searchable = true,
  searchKeys = [],
  haveDrawer = false,

  // Actions
  actions,
  onSelectionChange,

  // Table props
  loading = false,
  pagination,
  scroll,

  // Customization
  emptyText = "ไม่พบข้อมูล",

  // Drawer props
  drawerWidth,
  drawerPlacement,
  drawerTitle,
  drawerFooter,
  drawerDestroyOnClose,
  drawerMaskClosable,
  drawerClassName,
  drawerBodyStyle,
  drawerHeaderStyle,
  drawerFooterStyle,
  renderDrawer,

  ...restProps
}: MTableProps<T>) {
  // Confirm delete state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState<T | null>(null);

  const handleDeleteClick = React.useCallback((record: T) => {
    setDeleteRecord(record);
    setDeleteConfirmOpen(true);
  }, []);
  const handleDeleteConfirm = () => {
    if (deleteRecord && actions?.onDelete) {
      actions.onDelete(deleteRecord);
    }
    setDeleteConfirmOpen(false);
    setDeleteRecord(null);
  };
  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setDeleteRecord(null);
  };
  // State management

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<T | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    if (pagination && typeof pagination === "object") {
      return pagination.pageSize || pagination.defaultPageSize || 10;
    }
    return 10;
  });

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm || !searchable) return dataSource;

    const keysToSearch =
      searchKeys.length > 0
        ? searchKeys
        : (columns.map((col) => col.dataIndex).filter(Boolean) as string[]);

    return dataSource.filter((item) =>
      keysToSearch.some((key) => {
        const value = get(item, key);
        return String(value || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      })
    );
  }, [dataSource, searchTerm, searchKeys, columns, searchable]);

  // Row selection configuration
  const rowSelection = selectable
    ? {
        selectedRowKeys,
        onChange: (selectedKeys: React.Key[], selectedRows: T[]) => {
          setSelectedRowKeys(selectedKeys);
          onSelectionChange?.(selectedRows, selectedKeys);
        },
      }
    : undefined;

  // Default view handler
  const handleDefaultView = React.useCallback((record: T) => {
    setSelectedRecord(record);
    setDetailDrawerOpen(true);
  }, []);

  // Enhanced columns with search highlighting and actions
  const enhancedColumns = useMemo(() => {
    // Filter columns first if columnsShow is provided
    const columnsToProcess =
      columnsShow.length > 0
        ? columns.filter(
            (col) =>
              columnsShow.includes(col.key as string) ||
              columnsShow.includes(col.dataIndex as string)
          )
        : columns;

    const processedColumns = columnsToProcess.map((col) => ({
      ...col,
      render: (value: unknown, record: T, index: number) => {
        const originalRender = col.render?.(value, record, index) || value;

        // Apply search highlighting if searchable and term exists
        if (
          searchTerm &&
          searchable &&
          searchKeys.includes((col.dataIndex as string) || "")
        ) {
          return highlightText(String(originalRender || ""), searchTerm);
        }

        return originalRender;
      },
    }));

    // Add action column if actions are provided or additional columns exist
    const hasActions =
      actions?.onEdit ||
      actions?.onDelete ||
      actions?.onView ||
      (haveDrawer &&
        (columnsShow.length < columns.length || columnsAdditional.length > 0));
    if (hasActions) {
      processedColumns.push({
        title: "",
        key: "actions",
        width: 120,
        fixed: "right" as const,
        render: (_: unknown, record: T) => (
          <Space size="small">
            {actions?.onEdit && (
              <Tooltip title="แก้ไข">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => actions.onEdit!(record)}
                />
              </Tooltip>
            )}
            {(actions?.onView ||
              (haveDrawer &&
                (columnsShow.length < columns.length ||
                  columnsAdditional.length > 0))) && (
              <Tooltip title="ดูรายละเอียด">
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() =>
                    actions?.onView
                      ? actions.onView(record)
                      : handleDefaultView(record)
                  }
                />
              </Tooltip>
            )}
            {actions?.onDelete && (
              <Tooltip title="ลบ">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteClick(record)}
                />
              </Tooltip>
            )}
          </Space>
        ),
      });
    }

    return processedColumns;
  }, [
    columns,
    actions,
    columnsAdditional,
    columnsShow,
    searchTerm,
    searchable,
    searchKeys,
    handleDefaultView,
    haveDrawer,
    handleDeleteClick,
  ]);

  // Pagination handlers
  const handlePaginationChange = (page: number, size?: number) => {
    const newSize = size || pageSize;
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }

    // Call original pagination onChange if provided
    if (pagination && typeof pagination === "object" && pagination.onChange) {
      pagination.onChange(page, newSize);
    }
  };

  const handlePageSizeChange = (current: number, size: number) => {
    setCurrentPage(1); // Reset to first page when changing page size
    setPageSize(size);

    // Call original pagination onShowSizeChange if provided
    if (
      pagination &&
      typeof pagination === "object" &&
      pagination.onShowSizeChange
    ) {
      pagination.onShowSizeChange(current, size);
    }
  };

  // Default pagination config
  const defaultPagination =
    pagination === false
      ? false
      : {
          current: currentPage,
          pageSize: pageSize,
          total: filteredData.length,
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} จาก ${total} รายการ`,
          pageSizeOptions: ["10", "20", "50", "100"],
          responsive: true,
          onChange: handlePaginationChange,
          onShowSizeChange: handlePageSizeChange,
          // Override with user provided pagination config, but keep our handlers
          ...(pagination && typeof pagination === "object"
            ? {
                ...pagination,
                current: currentPage,
                onChange: handlePaginationChange,
                onShowSizeChange: handlePageSizeChange,
              }
            : {}),
        };

  return (
    <TableContainer>
      {/* Header with table info */}
      <ViewToggleContainer>
        <div className="table-info">
          <Typography.Title level={4}>{tableName}</Typography.Title>
          <span className="total-count">
            ทั้งหมด{" "}
            {defaultPagination && typeof defaultPagination === "object"
              ? defaultPagination.total
              : dataSource.length}{" "}
            รายการ
            {selectable && selectedRowKeys.length > 0 && (
              <span style={{ color: "#1890ff", marginLeft: "8px" }}>
                (เลือกแล้ว {selectedRowKeys.length} รายการ)
              </span>
            )}
          </span>
        </div>
      </ViewToggleContainer>

      {/* Search */}
      {searchable && (
        <SearchContainer>
          <Input.Search
            placeholder="ค้นหาข้อมูล..."
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<SearchOutlined />}
          />
        </SearchContainer>
      )}

      {/* Table Content */}
      <AntTable
        rowSelection={rowSelection}
        dataSource={filteredData}
        // @ts-expect-error - Type compatibility between our custom columns and AntD columns
        columns={enhancedColumns}
        rowKey={rowKey}
        loading={loading}
        pagination={defaultPagination}
        scroll={scroll}
        locale={{ emptyText }}
        {...restProps}
      />

      {/* Detail Drawer */}
      <DetailDrawer<T>
        open={haveDrawer && detailDrawerOpen}
        onClose={() => {
          setDetailDrawerOpen(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
        columns={columns}
        titleColumn={titleColumn}
        subtitleColumn={subtitleColumn}
        width={drawerWidth}
        placement={drawerPlacement}
        title={drawerTitle}
        footer={drawerFooter}
        destroyOnClose={drawerDestroyOnClose}
        maskClosable={drawerMaskClosable}
        className={drawerClassName}
        bodyStyle={drawerBodyStyle}
        headerStyle={drawerHeaderStyle}
        footerStyle={drawerFooterStyle}
        renderDrawer={renderDrawer}
      />

      {/* Delete confirm modal */}
      <Modal
        open={deleteConfirmOpen}
        title="ยืนยันการลบ"
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="ลบ"
        cancelText="ยกเลิก"
        okButtonProps={{ danger: true }}
      >
        <div>คุณต้องการลบข้อมูลนี้ใช่หรือไม่?</div>
      </Modal>
    </TableContainer>
  );
}

export default MTable;
