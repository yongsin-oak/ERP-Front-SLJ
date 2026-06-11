import { useMemo } from 'react';
import { Table as AntTable } from 'antd';
import type { TableProps as AntTableProps, ColumnType as AntColumnType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';

export type ColumnType<T> = AntColumnType<T> & {
  /** เปิด text-search filter อัตโนมัติบน column นี้ (search ใน dataIndex หรือ field ที่ระบุ) */
  searchable?: boolean;
  /** field ที่จะใช้ search ถ้าต่างจาก dataIndex (รองรับ object path) */
  searchKey?: string;
};

export interface TableProps<T extends object = object>
  extends Omit<AntTableProps<T>, 'columns'> {
  columns?: ColumnType<T>[];
}

function getValue(record: unknown, path: string | number | (string | number)[]): unknown {
  const parts = Array.isArray(path) ? path : [path];
  let cur: unknown = record;
  for (const p of parts) {
    if (cur == null) return cur;
    cur = (cur as Record<string, unknown>)[String(p)];
  }
  return cur;
}

/** เพิ่ม sort + filter dropdown อัตโนมัติให้ column ที่ใส่ sorter ไม่มา / searchable */
function enhanceColumns<T extends object>(columns: ColumnType<T>[]): ColumnType<T>[] {
  return columns.map((col) => {
    const out: ColumnType<T> = { ...col };
    // Search filter
    if (col.searchable && !col.filterDropdown) {
      const searchPath = col.searchKey ?? (col.dataIndex as string | number | (string | number)[] | undefined);
      out.filterDropdown = ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Input
            placeholder={`ค้นหา ${typeof col.title === 'string' ? col.title : ''}`}
            value={selectedKeys[0] as string}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, width: 200, display: 'block' }}
            allowClear
            onClear={() => { clearFilters?.(); confirm(); }}
            autoFocus
          />
        </div>
      );
      out.filterIcon = (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
      );
      if (!out.onFilter && searchPath !== undefined) {
        out.onFilter = (value, record) => {
          const v = getValue(record, searchPath as never);
          if (v == null) return false;
          return String(v).toLowerCase().includes(String(value).toLowerCase());
        };
      }
    }
    return out;
  });
}

export function Table<T extends object = object>({
  pagination,
  columns,
  size,
  scroll,
  ...props
}: TableProps<T>) {
  const enhancedColumns = useMemo(
    () => (columns ? enhanceColumns(columns) : columns),
    [columns],
  );

  return (
    <AntTable<T>
      size={size ?? 'middle'}
      scroll={scroll ?? { x: 'max-content' }}
      sticky
      columns={enhancedColumns}
      showSorterTooltip={{ title: 'คลิกเพื่อจัดเรียง' }}
      pagination={
        pagination === false
          ? false
          : {
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`,
              defaultPageSize: 20,
              pageSizeOptions: ['10', '20', '50', '100'],
              ...((pagination as object) || {}),
            }
      }
      {...props}
    />
  );
}

Table.Summary = AntTable.Summary;
