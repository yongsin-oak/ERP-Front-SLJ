import { useState, useMemo } from 'react';
import { Flex, Select, InputNumber, Table as AntTable, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, PageHeader } from '@design-system';
import { EntryMetaBar } from '../components/EntryMetaBar';
import { useBulkCreateStockEntry } from '../react-query';
import { useEmployeeList } from '@features/employee';
import { useProducts } from '@features/inventory';

interface ReceiveRow {
  key: string;
  productBarcode: string;
  type: 'in' | 'return';
  quantity: number;
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
  const productOptions = useMemo(
    () => products.map((p) => ({ label: `${p.name} (${p.barcode})`, value: p.barcode })),
    [products],
  );

  function updateRow(key: string, patch: Partial<ReceiveRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  async function handleSave() {
    const entries = rows.filter((r) => r.productBarcode && r.quantity > 0);
    if (!entries.length) return;
    await bulkCreate.mutateAsync({ employeeId, note: note || undefined, entries });
    setRows([newRow()]);
    setNote('');
    setEmployeeId(undefined);
  }

  const canSave = rows.some((r) => r.productBarcode && r.quantity > 0);

  const columns = [
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
      width: 140,
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

      <div style={{ maxWidth: 900 }}>
        <EntryMetaBar
          employeeOptions={employeeOptions}
          employeeId={employeeId}
          note={note}
          onEmployeeChange={setEmployeeId}
          onNoteChange={setNote}
        />

        <AntTable
          rowKey="key"
          columns={columns}
          dataSource={rows}
          pagination={false}
          size="middle"
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

        {rows.some((r) => r.productBarcode) && (
          <div style={{ marginTop: 16, padding: '10px 16px', background: '#f6ffed', borderRadius: 6, border: '1px solid #b7eb8f' }}>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              สรุป: {rows.filter((r) => r.productBarcode && r.quantity > 0).length} รายการ
              รวม {rows.filter((r) => r.productBarcode).reduce((s, r) => s + r.quantity, 0).toLocaleString()} แพ็ค
            </Typography.Text>
          </div>
        )}
      </div>
    </div>
  );
}
