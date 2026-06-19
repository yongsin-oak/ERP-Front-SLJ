import { useState, useMemo } from 'react';
import { Flex, InputNumber, Typography, Alert } from 'antd';
import { Table, Button, PageHeader , AppIcons } from '@design-system';
import type { ColumnType } from '@design-system';
import { EntryMetaBar } from '../components/EntryMetaBar';
import { useBulkAdjustStock } from '../react-query';
import { useEmployeeList } from '@features/employee/react-query';
import { ProductDropdownSelect } from '@features/inventory';

interface AdjustRow {
  key: string;
  productBarcode: string;
  actualQuantity: number;
  currentRemaining?: number;
}

let rowId = 0;
function newRow(): AdjustRow {
  return { key: String(rowId++), productBarcode: '', actualQuantity: 0 };
}

export function StockAdjustPage() {
  const [rows, setRows] = useState<AdjustRow[]>([newRow()]);
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const [note, setNote] = useState('');

  const bulkAdjust = useBulkAdjustStock();

  const { data: empData } = useEmployeeList({ page: 1, limit: 200 });
  const employees = empData?.data ?? [];
  const employeeOptions = useMemo(
    () => employees.map((e) => ({ label: `${e.firstName} (${e.nickname})`, value: e.id })),
    [employees],
  );

  function updateRow(key: string, patch: Partial<AdjustRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  async function handleSave() {
    const adjustments = rows
      .filter((r) => r.productBarcode)
      .map((r) => ({ productBarcode: r.productBarcode, actualQuantity: r.actualQuantity }));
    if (!adjustments.length) return;
    await bulkAdjust.mutateAsync({ employeeId, note: note || undefined, adjustments });
    setRows([newRow()]);
    setNote('');
    setEmployeeId(undefined);
  }

  const canSave = rows.some((r) => r.productBarcode);

  const columns: ColumnType<AdjustRow>[] = [
    {
      title: 'สินค้า',
      dataIndex: 'productBarcode',
      render: (_: string, r: AdjustRow) => (
        <ProductDropdownSelect
          placeholder="เลือกสินค้า"
          style={{ width: '100%', minWidth: 260 }}
          allowClear
          value={r.productBarcode || undefined}
          onChange={(v) =>
            updateRow(
              r.key,
              v
                ? { productBarcode: v }
                : { productBarcode: '', currentRemaining: undefined, actualQuantity: 0 },
            )
          }
          onSelect={(barcode, product) =>
            updateRow(r.key, {
              productBarcode: barcode,
              currentRemaining: product.remaining,
              actualQuantity: product.remaining,
            })
          }
        />
      ),
    },
    {
      title: 'สต็อกปัจจุบัน',
      dataIndex: 'currentRemaining',
      width: 130,
      align: 'right' as const,
      render: (v?: number) => v != null ? <Typography.Text type="secondary">{v}</Typography.Text> : '-',
    },
    {
      title: 'จำนวนที่นับได้จริง',
      dataIndex: 'actualQuantity',
      width: 160,
      render: (_: number, r: AdjustRow) => (
        <InputNumber
          min={0}
          style={{ width: '100%' }}
          value={r.actualQuantity}
          onChange={(v) => updateRow(r.key, { actualQuantity: v ?? 0 })}
          status={
            r.currentRemaining != null && r.actualQuantity !== r.currentRemaining
              ? 'warning'
              : undefined
          }
        />
      ),
    },
    {
      title: 'ผลต่าง',
      key: 'diff',
      width: 90,
      align: 'right' as const,
      render: (_: unknown, r: AdjustRow) => {
        if (r.currentRemaining == null) return '-';
        const diff = r.actualQuantity - r.currentRemaining;
        if (diff === 0) return <Typography.Text type="secondary">0</Typography.Text>;
        return (
          <Typography.Text type={diff > 0 ? 'success' : 'danger'}>
            {diff > 0 ? `+${diff}` : diff}
          </Typography.Text>
        );
      },
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: (_: unknown, r: AdjustRow) => (
        <Button
          variant="danger-ghost"
          size="small"
          icon={<AppIcons.delete />}
          onClick={() => removeRow(r.key)}
          disabled={rows.length === 1}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="ปรับสต็อก (Stock Count)"
        subtitle="นับสต็อกจริงแล้วตั้งค่าทีเดียวหลายรายการ"
      />

      <Alert
        type="warning"
        showIcon
        message="การปรับสต็อกจะ set ค่าสต็อกเป็นตัวเลขที่กรอก ไม่ใช่บวกเพิ่ม"
        style={{ marginBottom: 16, maxWidth: 900 }}
      />

      <div style={{ maxWidth: 900 }}>
        <EntryMetaBar
          employeeOptions={employeeOptions}
          employeeId={employeeId}
          note={note}
          notePlaceholder="เช่น นับสต็อกประจำเดือน พ.ค. 2026"
          onEmployeeChange={setEmployeeId}
          onNoteChange={setNote}
        />

        <Table<AdjustRow>
          rowKey="key"
          columns={columns}
          dataSource={rows}
          pagination={false}
          size="middle"
          scroll={{ x: 'max-content' }}
        />

        <Flex gap={8} style={{ marginTop: 12 }}>
          <Button icon={<AppIcons.add />} onClick={() => setRows((p) => [...p, newRow()])}>
            เพิ่มรายการ
          </Button>
          <Button
            variant="primary"
            loading={bulkAdjust.isPending}
            disabled={!canSave}
            onClick={handleSave}
          >
            บันทึกการปรับสต็อก
          </Button>
        </Flex>
      </div>
    </div>
  );
}
