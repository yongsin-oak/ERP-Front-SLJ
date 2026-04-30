import { Table as AntTable } from 'antd';
import type { TableProps as AntTableProps, ColumnType } from 'antd/es/table';

export type { ColumnType };

export interface TableProps<T extends object = object> extends AntTableProps<T> {}

export function Table<T extends object = object>({ pagination, ...props }: TableProps<T>) {
  return (
    <AntTable<T>
      size="middle"
      pagination={
        pagination === false
          ? false
          : {
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`,
              defaultPageSize: 20,
              pageSizeOptions: ['10', '20', '50'],
              ...((pagination as object) || {}),
            }
      }
      {...props}
    />
  );
}
