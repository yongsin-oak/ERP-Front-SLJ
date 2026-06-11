import { useState, useMemo } from 'react';
import { Flex, InputNumber, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Table, Button, PageHeader, Select, colors } from '@design-system';
import type { ColumnType } from '@design-system';
import { EntryMetaBar } from '../components/EntryMetaBar';
import { useBulkCreateStockEntry } from '../react-query';
import { useEmployeeList } from '@features/employee/react-query';
import { useProducts } from '@features/inventory';

interface ReceiveRow {
  key: string;
  productBarcode: string;
  type: 'in' | 'return';
  quantity: number;
  costPricePerUnit?: number;
}

let rowId = 0;
function newRow(): ReceiveRow {
  return { key: String(rowId++), productBarcode: '', type: 'in', quantity: 1 };
}

export function StockReceivePage() {
  const [rows, setRows] = useState<ReceiveRow[]>([newRow()]);
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const [note, setNote] = useState('');

  const bulkCreate = useBulkCreateStockEntry();

  const { data: empData } = useEmployeeList({ page: 1, limit: 200 });
  const employees = empData?.data ?? [];
  const employeeOptions = useMemo(
    () => employees.map((e) => ({ label: `${e.firstName} (${e.nickname})`, value: e.id })),
    [employees],
  );

  const { data: prodData } = useProducts({ page: 1, limit: 500 });
  const products = prodData?.data ?? [];
  const productMap = useMemo(() => new Map(products.map((p) => [p.barcode, p])), [products]);
  const productOptions = useMemo(
    () => products.map((p) => ({ label: `${p.name} (${p.barcode})`, value: p.barcode })),
    [products],
  );

  function updateRow(key: string, patch: Partial<ReceiveRow>) {
    setRows((prev) => prev.map((r) => {
      if (r.key !== key) return r;
      const updated = { ...r, ...patch };
      if (patch.productBarcode !== undefined) {
        const prod = productMap.get(patch.productBarcode);
        updated.costPricePerUnit = prod?.costPrice?.pack ?? undefined;
      }
      return updated;
    }));
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  async function handleSave() {
    const entries = rows
      .filter((r) => r.productBarcode && r.quantity > 0)
      .map((r) => ({
        productBarcode: r.productBarcode,
        type: r.type,
        quantity: r.quantity,
        costPricePerUnit: r.type === 'in' ? r.costPricePerUnit : undefined,
      }));
    if (!entries.length) return;
    await bulkCreate.mutateAsync({ employeeId, note: note || undefined, entries });
    setRows([newRow()]);
    setNote('');
    setEmployeeId(undefined);
  }

  const canSave = rows.some((r) => r.productBarcode && r.quantity > 0);
  const validRows = rows.filter((r) => r.productBarcode && r.quantity > 0);
  const totalQty = validRows.reduce((s, r) => s + r.quantity, 0);
  const totalCost = validRows
    .filter((r) => r.type === 'in' && r.costPricePerUnit)
    .reduce((s, r) => s + r.quantity * (r.costPricePerUnit ?? 0), 0);

  const columns: ColumnType<ReceiveRow>[] = [
    {
      title: 'สินค้า',
      dataIndex: 'productBarcode',
      render: (_: string, r: ReceiveRow) => (
        <Select
          showSearch={{ optionFilterProp: 'label' }}
          placeholder="เลือกสินค้า"
          style={{ width: '100%', minWidth: 220 }}
          options={productOptions}
          value={r.productBarcode || undefined}
          onChange={(v) => updateRow(r.key, { productBarcode: v })}
        />
      ),
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      width: 130,
      render: (_: string, r: ReceiveRow) => (
        <Select
          style={{ width: '100%' }}
          value={r.type}
          options={[
            { label: 'รับสินค้าเข้า', value: 'in' },
            { label: 'รับคืน', value: 'return' },
          ]}
          onChange={(v) => updateRow(r.key, { type: v })}
        />
      ),
    },
    {
      title: 'จำนวน (แพ็ค)',
      dataIndex: 'quantity',
      width: 130,
      render: (_: number, r: ReceiveRow) => (
        <InputNumber
          min={1}
          style={{ width: '100%' }}
          value={r.quantity}
          onChange={(v) => updateRow(r.key, { quantity: v ?? 1 })}
        />
      ),
    },
    {
      title: 'ราคาทุน/แพ็ค (฿)',
      dataIndex: 'costPricePerUnit',
      width: 150,
      render: (_: number, r: ReceiveRow) =>
        r.type === 'in' ? (
          <InputNumber
            min={0}
            precision={2}
            placeholder="0.00"
            style={{ width: '100%' }}
            value={r.costPricePerUnit}
            onChange={(v) => updateRow(r.key, { costPricePerUnit: v ?? undefined })}
          />
        ) : (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>—</Typography.Text>
        ),
    },
    {
      title: 'มูลค่า',
      key: 'value',
      width: 110,
      align: 'right' as const,
      render: (_: unknown, r: ReceiveRow) => {
        if (r.type !== 'in' || !r.costPricePerUnit) return '-';
        return (
          <Typography.Text>฿{(r.quantity * r.costPricePerUnit).toLocaleString()}</Typography.Text>
        );
      },
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: (_: unknown, r: ReceiveRow) => (
        <Button
          variant="danger-ghost"
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => removeRow(r.key)}
          disabled={rows.length === 1}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="รับสินค้าเข้าคลัง"
        subtitle="บันทึกการรับสินค้าหลายรายการพร้อมกัน"
      />

      <div style={{ maxWidth: 1000 }}>
        <EntryMetaBar
          employeeOptions={employeeOptions}
          employeeId={employeeId}
          note={note}
          onEmployeeChange={setEmployeeId}
          onNoteChange={setNote}
        />

        <Table<ReceiveRow>
          rowKey="key"
          columns={columns}
          dataSource={rows}
          pagination={false}
          size="middle"
          scroll={{ x: 'max-content' }}
        />

        <Flex gap={8} style={{ marginTop: 12 }}>
          <Button icon={<PlusOutlined />} onClick={() => setRows((p) => [...p, newRow()])}>
            เพิ่มรายการ
          </Button>
          <Button
            variant="primary"
            loading={bulkCreate.isPending}
            disabled={!canSave}
            onClick={handleSave}
          >
            บันทึกการรับสินค้า
          </Button>
        </Flex>

        {validRows.length > 0 && (
          <div style={{ marginTop: 16, padding: '10px 16px', background: colors.semantic.successBg, borderRadius: 6, border: `1px solid ${colors.semantic.successBorder}` }}>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              สรุป: {validRows.length} รายการ · รวม {totalQty.toLocaleString()} แพ็ค
              {totalCost > 0 && ` · มูลค่ารับเข้า ฿${totalCost.toLocaleString()}`}
            </Typography.Text>
          </div>
        )}
      </div>
    </div>
  );
}
