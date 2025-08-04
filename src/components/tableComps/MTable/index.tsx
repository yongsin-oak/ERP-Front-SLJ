import React, { useState, useMemo, useEffect } from "react";
import {
  Table as AntTable,
  Input,
  Space,
  Checkbox,
  Collapse,
  Tooltip,
  Button,
  Typography,
  Card,
  TableProps,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  TableOutlined,
  AppstoreOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import styled from "@emotion/styled";
import { get, includes, isEmpty } from "lodash";
import { useWindowSize } from "@uidotdev/usehooks";
import DetailDrawer from "./DetailDrawer";
import { ColumnType } from "antd/es/table";
import { isMobile } from "@utils/responsive";

const { Text } = Typography;

// Styled Components
const TableContainer = styled.div`
  width: 100%;
  .ant-table-wrapper {
    .ant-table-thead > tr > th {
      background: #fafafa;
      font-weight: 600;
    }
  }
`;

const ViewToggleContainer = styled.div`
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

const CardContainer = styled(Card)`
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

const SearchContainer = styled.div`
  margin-bottom: 16px;

  .ant-input-search {
    max-width: 400px;

    @media (max-width: 768px) {
      max-width: 100%;
    }
  }
`;

const EmptyStateContainer = styled.div`
  text-align: center;
  padding: 48px 0;
  color: #8c8c8c;
`;

export interface MTableAction<T> {
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  onView?: (record: T) => void;
}

export interface MTableProps<T> extends TableProps<T> {
  // Required props
  columns: ColumnType<T>[];
  dataSource: T[];
  rowKey: string;

  // Display configuration
  tableName?: string;
  titleColumn?: string;
  subtitleColumn?: string;
  columnsShow?: string[]; // Columns to show in card view main area
  columnsAdditional?: string[]; // Columns to show in expandable section

  // Features
  selectable?: boolean;
  showViewToggle?: boolean;
  searchable?: boolean;
  searchKeys?: string[]; // Keys to search in

  // View mode
  viewMode?: "table" | "card" | "auto"; // auto = responsive

  // Actions
  actions?: MTableAction<T>;
  onSelectionChange?: (selectedRows: T[], selectedKeys: React.Key[]) => void;

  // Table props passthrough
  loading?: boolean;
  pagination?: TableProps<T>["pagination"];
  scroll?: TableProps<T>["scroll"];

  // Customization
  emptyText?: string;
  additionalDetailsLabel?: string;

  // Drawer props
  drawerWidth?: number | string;
  drawerPlacement?: "top" | "right" | "bottom" | "left";
  drawerTitle?: React.ReactNode;
  drawerFooter?: React.ReactNode;
  drawerDestroyOnClose?: boolean;
  drawerMaskClosable?: boolean;
  drawerClassName?: string;
  drawerBodyStyle?: React.CSSProperties;
  drawerHeaderStyle?: React.CSSProperties;
  drawerFooterStyle?: React.CSSProperties;
  renderDrawer?: (
    drawerProps: unknown,
    content: React.ReactNode
  ) => React.ReactNode;
}

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

  // Update view mode when screen size changes (only for auto mode)
  useEffect(() => {
    if (viewMode === "auto") {
      setCurrentViewMode(mobile ? "card" : "table");
    }
  }, [mobile, viewMode]);

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

    console.log(columnsShow, columns);
    // Add action column if actions are provided or additional columns exist
    const hasActions =
      actions?.onEdit ||
      actions?.onDelete ||
      actions?.onView ||
      columnsShow.length < columns.length ||
      columnsAdditional.length > 0;
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
              columnsShow.length < columns.length ||
              columnsAdditional.length > 0) && (
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
                  onClick={() => actions.onDelete!(record)}
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
  ]);

  // Card view renderer
  const renderCardView = () => {
    if (filteredData.length === 0) {
      return (
        <EmptyStateContainer>
          <Text type="secondary">{emptyText}</Text>
        </EmptyStateContainer>
      );
    }

    return (
      <Space direction="vertical" style={{ width: "100%" }} size={16}>
        {filteredData.map((record) => {
          const id = get(record, rowKey);

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
            columnsAdditional.length > 0 || columnsShow.length < columns.length
              ? (!isEmpty(columnsAdditional)
                  ? columnsAdditional
                  : columns
                      .filter((col) => !includes(columnsShow, col.key))
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
                        newKeys.includes(get(item, rowKey) as React.Key)
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
                  {actions?.onDelete && (
                    <Tooltip title="ลบ">
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => actions.onDelete!(record)}
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

                {(columnsShow.length < columns.length ||
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
      </Space>
    );
  };

  // Default pagination config
  const defaultPagination = {
    total: filteredData.length,
    showQuickJumper: true,
    showSizeChanger: true,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} จาก ${total} รายการ`,
    pageSizeOptions: ["10", "20", "50", "100"],
    defaultPageSize: 10,
    responsive: true,
    ...pagination,
  };

  return (
    <TableContainer>
      {/* Header with view toggle and info */}
      {showViewToggle && (
        <ViewToggleContainer>
          <div className="table-info">
            <Typography.Title level={4}>{tableName}</Typography.Title>
            <span className="total-count">
              ทั้งหมด {defaultPagination?.total || dataSource.length} รายการ
            </span>
          </div>

          <div className="view-toggle">
            <Button.Group>
              <Button
                icon={<TableOutlined />}
                type={currentViewMode === "table" ? "primary" : "default"}
                onClick={() => setCurrentViewMode("table")}
                disabled={viewMode === "auto" && !!mobile}
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
            </Button.Group>
          </div>
        </ViewToggleContainer>
      )}

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
        open={detailDrawerOpen}
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
    </TableContainer>
  );
}

export default MTable;
