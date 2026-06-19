import { useState, useMemo } from 'react';
import { Flex, InputNumber, Typography, Alert } from 'antd';
import { Table, Button, PageHeader, colors , AppIcons } from '@design-system';
import type { ColumnType } from '@design-system';
import { EntryMetaBar } from '../components/EntryMetaBar';
import { useBulkDamage } from '../react-query';
import { useEmployeeList } from '@features/employee/react-query';
import { ProductDropdownSelect } from '@features/inventory';

interface DamageRow {
  key: string;
  productBarcode: string;
  quantity: number;
  costPricePerUnit: number;
  currentRemaining?: number;
}

let rowId = 0;
function newRow(): DamageRow {
  return { key: String(rowId++), productBarcode: '', quantity: 1, costPricePerUnit: 0 };
}

export function StockDamagePage() {
  const [rows, setRows] = useState<DamageRow[]>([newRow()]);
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const [note, setNote] = useState('');

  const bulkDamage = useBulkDamage();

  const { data: empData } = useEmployeeList({ page: 1, limit: 200 });
  const employees = empData?.data ?? [];
  const employeeOptions = useMemo(
    () => employees.map((e) => ({ label: `${e.firstName} (${e.nickname})`, value: e.id })),
    [employees],
  );

  function updateRow(key: string, patch: Partial<DamageRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  async function handleSave() {
    const entries = rows
      .filter((r) => r.productBarcode && r.quantity > 0)
      .map((r) => ({
        productBarcode: r.productBarcode,
        type: 'damage' as const,
        quantity: r.quantity,
        costPricePerUnit: r.costPricePerUnit || undefined,
      }));
    if (!entries.length) return;
    await bulkDamage.mutateAsync({ employeeId, note: note || undefined, entries });
    setRows([newRow()]);
    setNote('');
    setEmployeeId(undefined);
  }

  const canSave = rows.some((r) => r.productBarcode && r.quantity > 0);
  const validRows = rows.filter((r) => r.productBarcode && r.quantity > 0);
  const totalQty = validRows.reduce((s, r) => s + r.quantity, 0);
  const totalLoss = validRows.reduce((s, r) => s + r.quantity * (r.costPricePerUnit ?? 0), 0);

  const columns: ColumnType<DamageRow>[] = [
    {
      title: 'สินค้า',
      dataIndex: 'productBarcode',
      render: (_: string, r: DamageRow) => (
        <ProductDropdownSelect
          placeholder="เลือกสินค้า"
          style={{ width: '100%', minWidth: 240 }}
          allowClear
          value={r.productBarcode || undefined}
          onChange={(v) =>
            updateRow(
              r.key,
              v
                ? { productBarcode: v }
                : { productBarcode: '', currentRemaining: undefined, costPricePerUnit: 0 },
            )
          }
          onSelect={(barcode, product) =>
            updateRow(r.key, {
              productBarcode: barcode,
              currentRemaining: product.remaining,
              costPricePerUnit: product.costPrice?.pack ?? 0,
            })
          }
        />
      ),
    },
    {
      title: 'สต็อกปัจจุบัน',
      dataIndex: 'currentRemaining',
      width: 120,
      align: 'right' as const,
      render: (v?: number) =>
        v != null ? <Typography.Text type="secondary">{v}</Typography.Text> : '-',
    },
    {
      title: 'จำนวนที่เสีย',
      dataIndex: 'quantity',
      width: 130,
      render: (_: number, r: DamageRow) => (
        <InputNumber
          min={1}
          max={r.currentRemaining}
          style={{ width: '100%' }}
          value={r.quantity}
          status={r.currentRemaining != null && r.quantity > r.currentRemaining ? 'error' : undefined}
          onChange={(v) => updateRow(r.key, { quantity: v ?? 1 })}
        />
      ),
    },
    {
      title: 'ราคาทุน/แพ็ค (฿)',
      dataIndex: 'costPricePerUnit',
      width: 150,
      render: (_: number, r: DamageRow) => (
        <InputNumber
          min={0}
          precision={2}
          placeholder="0.00"
          style={{ width: '100%' }}
          value={r.costPricePerUnit || undefined}
          onChange={(v) => updateRow(r.key, { costPricePerUnit: v ?? 0 })}
        />
      ),
    },
    {
      title: 'มูลค่าที่เสีย',
      key: 'loss',
      width: 120,
      align: 'right' as const,
      render: (_: unknown, r: DamageRow) => {
        if (!r.costPricePerUnit) return '-';
        const loss = r.quantity * r.costPricePerUnit;
        return (
          <Typography.Text type="danger">฿{loss.toLocaleString()}</Typography.Text>
        );
      },
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: (_: unknown, r: DamageRow) => (
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
        title="บันทึกของเสีย"
        subtitle="บันทึกสินค้าที่เสียหายหรือถูกทำลาย — สต็อกจะลดลงตามจำนวนที่กรอก"
      />

      <Alert
        type="warning"
        showIcon
        message="สต็อกจะลดลงทันที — กรุณาตรวจสอบจำนวนก่อนบันทึก"
        style={{ marginBottom: 16, maxWidth: 1000 }}
      />

      <div style={{ maxWidth: 1000 }}>
        <EntryMetaBar
          employeeOptions={employeeOptions}
          employeeId={employeeId}
          note={note}
          notePlaceholder="สาเหตุของเสีย เช่น สินค้าหมดอายุ, บรรจุภัณฑ์แตก"
          onEmployeeChange={setEmployeeId}
          onNoteChange={setNote}
        />

        <Table<DamageRow>
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
            variant="danger"
            loading={bulkDamage.isPending}
            disabled={!canSave}
            onClick={handleSave}
          >
            บันทึกของเสีย
          </Button>
        </Flex>

        {validRows.length > 0 && (
          <div
            style={{
              marginTop: 16,
              padding: '10px 16px',
              background: colors.semantic.errorBg,
              borderRadius: 6,
              border: `1px solid ${colors.semantic.errorBorder}`,
            }}
          >
            <Typography.Text style={{ fontSize: 13 }}>
              สรุป: {validRows.length} รายการ · {totalQty.toLocaleString()} แพ็ค
              {totalLoss > 0 && (
                <Typography.Text type="danger"> · มูลค่าที่เสีย ฿{totalLoss.toLocaleString()}</Typography.Text>
              )}
            </Typography.Text>
          </div>
        )}
      </div>
    </div>
  );
}
