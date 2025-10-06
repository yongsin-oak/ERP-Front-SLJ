import { TableProps } from "antd";
import { ColumnType } from "antd/es/table";
import { GetRowKey } from "antd/es/table/interface";

export interface MTableAction<T> {
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  onView?: (record: T) => void;
}

export interface MTableProps<T> extends TableProps<T> {
  // Required props
  columns: ColumnType<T>[];
  dataSource: T[];
  rowKey?: string | keyof T | GetRowKey<T>;

  // Display configuration
  tableName?: string;
  titleColumn?: string;
  subtitleColumn?: string;
  columnsShow?: string[]; // Columns to show in drawer
  columnsAdditional?: string[]; // Columns to show in expandable section

  // Features
  selectable?: boolean;
  searchable?: boolean;
  searchKeys?: string[]; // Keys to search in
  haveDrawer?: boolean; // Enable detail drawer on row click

  // Actions
  actions?: MTableAction<T>;
  onSelectionChange?: (selectedRows: T[], selectedKeys: React.Key[]) => void;

  // Table props passthrough
  loading?: boolean;
  pagination?: TableProps<T>["pagination"];
  scroll?: TableProps<T>["scroll"];

  // Customization
  emptyText?: string;

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
