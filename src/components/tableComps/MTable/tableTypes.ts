import { TableColumnType } from "antd";
import React from "react";

export type ColumnRenderFunction<T> = (
  value: any,
  record: T,
  index: number
) => React.ReactNode;

// Compatible column definition
export interface CustomColumnType<T> {
  title?: React.ReactNode;
  dataIndex?: string;
  key?: string;
  width?: number | string;
  fixed?: "left" | "right";
  render?: ColumnRenderFunction<T>;
}

// Type for converting our custom columns to Ant Design columns
export function convertColumns<T>(
  columns: CustomColumnType<T>[]
): TableColumnType<T>[] {
  return columns as unknown as TableColumnType<T>[];
}
