import {
  AppstoreOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { useWindowSize } from "@uidotdev/usehooks";
import { isMobile } from "@utils/common/responsive";
import {
  Table as AntTable,
  Button,
  Checkbox,
  Collapse,
  Input,
  Pagination,
  Space,
  Tooltip,
  Typography,
  Modal,
} from "antd";
import { get, includes, isEmpty } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import DetailDrawer from "./DetailDrawer";
import { MTableProps } from "./interface";
import {
  CardContainer,
  EmptyStateContainer,
  SearchContainer,
  TableContainer,
  ViewToggleContainer,
} from "./styled";

const { Text } = Typography;

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
  showViewToggle = true,
  searchable = true,
  searchKeys = [],
  haveDrawer = false,

  // View
  viewMode = "auto",

  // Actions
  actions,
  onSelectionChange,

  // Table props
  loading = false,
  pagination,
  scroll,

  // Customization
  emptyText = "ไม่พบข้อมูล",
  additionalDetailsLabel = "ข้อมูลเพิ่มเติม",

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
  // Responsive detection
  const { width } = useWindowSize();
  const mobile = isMobile(width);

  // State management
  const [currentViewMode, setCurrentViewMode] = useState<"table" | "card">(
    () => {
      if (viewMode === "auto") {
        return mobile ? "card" : "table";
      }
      return viewMode;
    }
  );

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

  // Update view mode when screen size changes (only for auto mode)
  useEffect(() => {
    if (viewMode === "auto") {
      setCurrentViewMode(mobile ? "card" : "table");
    }
  }, [mobile, viewMode]);

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

  // Card view renderer
  const renderCardView = () => {
    if (filteredData.length === 0) {
      return (
        <EmptyStateContainer>
          <Text type="secondary">{emptyText}</Text>
        </EmptyStateContainer>
      );
    }

    // Pagination for card view (use shared state)
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Select all functionality for card view (based on current page)
    const currentPageKeys = paginatedData.map(
      (item) => get(item, rowKey as keyof T) as React.Key
    );
    const selectedOnCurrentPage = selectedRowKeys.filter((key) =>
      currentPageKeys.includes(key)
    );

    const isAllSelectedOnPage =
      selectedOnCurrentPage.length === paginatedData.length &&
      paginatedData.length > 0;
    const isIndeterminateOnPage =
      selectedOnCurrentPage.length > 0 &&
      selectedOnCurrentPage.length < paginatedData.length;

    const handleSelectAllOnPage = (checked: boolean) => {
      if (checked) {
        const newSelectedKeys = [
          ...new Set([...selectedRowKeys, ...currentPageKeys]),
        ];
        setSelectedRowKeys(newSelectedKeys);
        const selectedRows = filteredData.filter((item) =>
          newSelectedKeys.includes(get(item, rowKey as keyof T) as React.Key)
        );
        onSelectionChange?.(selectedRows, newSelectedKeys);
      } else {
        const newSelectedKeys = selectedRowKeys.filter(
          (key) => !currentPageKeys.includes(key)
        );
        setSelectedRowKeys(newSelectedKeys);
        const selectedRows = filteredData.filter((item) =>
          newSelectedKeys.includes(get(item, rowKey as keyof T) as React.Key)
        );
        onSelectionChange?.(selectedRows, newSelectedKeys);
      }
    };

    return (
      <Space direction="vertical" style={{ width: "100%" }} size={16}>
        {/* Select All Section for Card View */}
        {selectable && (
          <div
            style={{
              padding: "12px 16px",
              background: "#fafafa",
              borderRadius: "8px",
              border: "1px solid #f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Checkbox
                indeterminate={isIndeterminateOnPage}
                checked={isAllSelectedOnPage}
                onChange={(e) => handleSelectAllOnPage(e.target.checked)}
              />
              <Text>
                เลือกทั้งหมดในหน้านี้ ({selectedOnCurrentPage.length}/
                {paginatedData.length})
              </Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {filteredData.length > paginatedData.length && (
                <Button
                  size="small"
                  type="link"
                  onClick={() => {
                    const allKeys = filteredData.map(
                      (item) => get(item, rowKey as keyof T) as React.Key
                    );
                    setSelectedRowKeys(allKeys);
                    onSelectionChange?.(filteredData, allKeys);
                  }}
                >
                  เลือกทุกหน้า ({filteredData.length})
                </Button>
              )}
              {selectedRowKeys.length > 0 && (
                <Button
                  size="small"
                  type="text"
                  onClick={() => {
                    setSelectedRowKeys([]);
                    onSelectionChange?.([], []);
                  }}
                >
                  ยกเลิกทั้งหมด ({selectedRowKeys.length})
                </Button>
              )}
            </div>
          </div>
        )}
        {paginatedData.map((record) => {
          const id = get(record, rowKey as keyof T);

          // Main fields to show in card
          const mainFields =
            columnsShow.length > 0
              ? columnsShow.map((key) => {
                  const col = columns.find(
                    (c) => c.key === key || c.dataIndex === key
                  );
                  return {
                    label: col?.title || key,
                    value: col?.render
                      ? col.render(get(record, key), record, 0)
                      : get(record, key),
                  };
                })
              : columns
                  .filter(
                    (col) =>
                      col.key !== "actions" &&
                      !columnsAdditional.includes(
                        String(col.key || col.dataIndex)
                      )
                  )
                  .slice(0, 3) // Show first 3 columns by default
                  .map((col) => ({
                    label: col.title,
                    value: col.render
                      ? col.render(
                          get(record, String(col.dataIndex)),
                          record,
                          0
                        )
                      : get(record, String(col.dataIndex)),
                  }));

          // Additional fields for expandable section
          const additionalFields =
            haveDrawer &&
            (columnsAdditional.length > 0 ||
              columnsShow.length < columns.length)
              ? (!isEmpty(columnsAdditional)
                  ? columnsAdditional
                  : columns
                      .filter((col) => !includes(columnsShow, col.key))
                      .slice(3)
                      .map((col) => col.key)
                ).map((key) => {
                  const col = columns.find(
                    (c) => c.key === key || c.dataIndex === key
                  );
                  return {
                    label: col?.title || key,
                    value: col?.render
                      ? col.render(get(record, key as string), record, 0)
                      : get(record, key as string),
                  };
                })
              : [];

          return (
            <CardContainer key={String(id)}>
              <div className="card-header">
                {selectable && (
                  <Checkbox
                    checked={selectedRowKeys.includes(id as React.Key)}
                    onChange={(e) => {
                      const newKeys = e.target.checked
                        ? [...selectedRowKeys, id as React.Key]
                        : selectedRowKeys.filter((key) => key !== id);
                      setSelectedRowKeys(newKeys as React.Key[]);
                      const selectedRows = filteredData.filter((item) =>
                        newKeys.includes(
                          get(item, rowKey as keyof T) as React.Key
                        )
                      );
                      onSelectionChange?.(selectedRows, newKeys as React.Key[]);
                    }}
                  />
                )}

                <div className="card-title">
                  <div className="title">
                    {searchTerm
                      ? highlightText(
                          String(get(record, titleColumn) || ""),
                          searchTerm
                        )
                      : String(get(record, titleColumn) || "")}
                  </div>
                  {subtitleColumn && (
                    <div className="subtitle">
                      {searchTerm
                        ? highlightText(
                            String(get(record, subtitleColumn) || ""),
                            searchTerm
                          )
                        : String(get(record, subtitleColumn) || "")}
                    </div>
                  )}
                </div>

                <div className="card-actions">
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
                </div>
              </div>

              <div className="card-content">
                {mainFields.map((field, index) => (
                  <div key={index} className="info-row">
                    <div className="label">{String(field.label)}:</div>
                    <div className={`value ${!field.value ? "empty" : ""}`}>
                      {searchTerm && typeof field.value === "string"
                        ? highlightText(field.value || "ไม่ระบุ", searchTerm)
                        : typeof field.value === "object"
                        ? "ไม่ระบุ"
                        : String(field.value || "ไม่ระบุ")}
                    </div>
                  </div>
                ))}

                {haveDrawer &&
                  (columnsShow.length < columns.length ||
                    columnsAdditional.length > 0) && (
                    <div className="additional-info">
                      <Collapse
                        ghost
                        size="small"
                        items={[
                          {
                            key: "1",
                            label: additionalDetailsLabel,
                            children: (
                              <Space
                                direction="vertical"
                                style={{ width: "100%" }}
                                size={8}
                              >
                                {additionalFields.map((field, index) => (
                                  <div key={index} className="info-row">
                                    <div className="label">
                                      {String(field.label)}:
                                    </div>
                                    <div
                                      className={`value ${
                                        !field.value ? "empty" : ""
                                      }`}
                                    >
                                      {typeof field.value === "object"
                                        ? "ไม่ระบุ"
                                        : String(field.value || "ไม่ระบุ")}
                                    </div>
                                  </div>
                                ))}
                              </Space>
                            ),
                          },
                        ]}
                      />
                    </div>
                  )}
              </div>
            </CardContainer>
          );
        })}

        {/* Pagination for Card View */}
        {filteredData.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Pagination {...pagination} />
          </div>
        )}
      </Space>
    );
  };

  return (
    <TableContainer>
      {/* Header with view toggle and info */}
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

        {showViewToggle && (
          <div className="view-toggle">
            <Space.Compact>
              <Button
                icon={<TableOutlined />}
                type={currentViewMode === "table" ? "primary" : "default"}
                onClick={() => setCurrentViewMode("table")}
              >
                ตาราง
              </Button>
              <Button
                icon={<AppstoreOutlined />}
                type={currentViewMode === "card" ? "primary" : "default"}
                onClick={() => setCurrentViewMode("card")}
              >
                การ์ด
              </Button>
            </Space.Compact>
          </div>
        )}
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

      {/* Content based on view mode */}
      {currentViewMode === "table" ? (
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
      ) : (
        renderCardView()
      )}

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
