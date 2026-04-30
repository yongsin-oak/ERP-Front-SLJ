import { useState } from 'react';
import { Button, Dropdown } from 'antd';
import { DownloadOutlined, FileExcelOutlined, FileDoneOutlined } from '@ant-design/icons';
import type { SheetColumn } from '@lib/sheet';
import { useSheet } from '@lib/sheet';

interface Props<T extends Record<string, unknown>> {
  data: T[];
  columns: SheetColumn<T>[];
  fileName?: string;
  sheetName?: string;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
}

export function ExportButton<T extends Record<string, unknown>>({
  data,
  columns,
  fileName = 'export',
  sheetName,
  disabled,
  size = 'middle',
}: Props<T>) {
  const [loading, setLoading] = useState(false);
  const sheet = useSheet<T>({ columns, fileName, sheetName });

  async function run(type: 'xlsx' | 'csv') {
    setLoading(true);
    await Promise.resolve(); // yield ให้ UI update ก่อน
    try {
      if (type === 'xlsx') sheet.exportToExcel(data);
      else sheet.exportToCsv(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dropdown
      disabled={disabled || data.length === 0}
      menu={{
        items: [
          {
            key: 'xlsx',
            icon: <FileExcelOutlined style={{ color: '#217346' }} />,
            label: 'Export Excel (.xlsx)',
            onClick: () => run('xlsx'),
          },
          {
            key: 'csv',
            icon: <FileDoneOutlined />,
            label: 'Export CSV (.csv)',
            onClick: () => run('csv'),
          },
          { type: 'divider' },
          {
            key: 'template',
            icon: <DownloadOutlined />,
            label: 'Download Template',
            onClick: () => sheet.downloadTemplate(),
          },
        ],
      }}
    >
      <Button icon={<DownloadOutlined />} loading={loading} size={size}>
        Export
      </Button>
    </Dropdown>
  );
}
