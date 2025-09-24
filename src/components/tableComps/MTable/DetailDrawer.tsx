/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Drawer, Descriptions, Typography } from "antd";
import { get } from "lodash";
import { ColumnType } from "antd/es/table";

export interface DetailDrawerProps<T> {
  open: boolean;
  onClose: () => void;
  record: T | null;
  columns: ColumnType<T>[];
  titleColumn: keyof T | string;
  subtitleColumn?: keyof T | string;
  width?: number | string;
  placement?: "top" | "right" | "bottom" | "left";
  title?: React.ReactNode;
  footer?: React.ReactNode;
  destroyOnClose?: boolean;
  maskClosable?: boolean;
  className?: string;
  bodyStyle?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  footerStyle?: React.CSSProperties;
  renderDrawer?: (
    defaultDrawerProps: DetailDrawerProps<T>,
    content: React.ReactNode
  ) => React.ReactNode;
}

// Detail Drawer Component
const DetailDrawer = <T extends object>({
  open,
  onClose,
  record,
  columns,
  titleColumn,
  subtitleColumn,
  width = 480,
  placement = "right",
  title,
  footer,
  destroyOnClose = false,
  maskClosable = true,
  className,
  bodyStyle,
  headerStyle,
  footerStyle,
  renderDrawer,
}: DetailDrawerProps<T>) => {
  // If no record, render empty drawer that can still animate close
  const detailItems = record
    ? columns
        .filter((col) => col.key !== "actions" && col.title)
        .map((col) => {
          const value = col.render
            ? col.render(get(record, String(col.dataIndex || "")), record, 0)
            : get(record, String(col.dataIndex || ""));

          return {
            key: String(col.key ?? col.dataIndex ?? ""),
            label: col.title || "",
            children: value !== undefined && value !== null ? value : "ไม่ระบุ",
          };
        })
    : [];

  // Default title if not provided
  const defaultTitle = title || (
    <Typography.Text strong>
      {record
        ? String(get(record, String(titleColumn)) || "รายละเอียด")
        : "รายละเอียด"}
    </Typography.Text>
  );

  // Generate content for drawer
  const content = record ? (
    <Descriptions column={1} size="small" bordered items={detailItems as any} />
  ) : (
    <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
      ไม่มีข้อมูลให้แสดง
    </div>
  );

  // Use custom render function if provided, otherwise use default drawer
  if (renderDrawer) {
    return renderDrawer(
      {
        open,
        onClose,
        record,
        columns,
        titleColumn,
        subtitleColumn,
        width,
        placement,
        title: defaultTitle,
        footer,
        destroyOnClose,
        maskClosable,
        className,
        bodyStyle,
        headerStyle,
        footerStyle,
      },
      content
    );
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={width}
      placement={placement}
      title={defaultTitle}
      footer={footer}
      destroyOnClose={destroyOnClose}
      maskClosable={maskClosable}
      className={className}
      bodyStyle={bodyStyle}
      headerStyle={headerStyle}
      footerStyle={footerStyle}
    >
      {content}
    </Drawer>
  );
};

export default DetailDrawer;
