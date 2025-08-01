import { ColumnType } from "antd/es/table";

export interface CardListProps<T extends object> {
  dataSource?: T[];
  columns?: ColumnType<T>[];
  columnsShow?: string[];
  columnsAdditional?: string[];
  titleColumn: string;
  subtitleColumn?: string;
  rowKey: string;
  selectedItems?: React.Key[];
  searchTerm?: string;
  onSelectItem?: (id: React.Key, checked: boolean) => void;
  onEditItem?: (item: T) => void;
  onDeleteItem?: (item: T) => void;
  additionalDetailsLabel?: string;
  emptyStateMessage?: string;
}

export interface CardListField<T> {
  label: string;
  value: T[keyof T];
  type?: string;
}
