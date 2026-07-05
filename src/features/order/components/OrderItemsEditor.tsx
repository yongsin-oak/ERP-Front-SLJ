import { useState, useRef, useEffect } from 'react';
import { Button, Input, InputNumber, Table, Tag, AppIcons } from '@design-system';
import type { ColumnType, InputRef } from '@design-system';
import { ProductDropdownSelect, inventoryService } from '@features/inventory';
import type { ProductDropdown } from '@features/inventory';
import { getErrorMessage, notify } from '@shared';
import type { OrderItem } from '../types';

interface OrderItemsEditorProps {
  items: OrderItem[];
  onChange: (items: OrderItem[]) => void;
  /** trigger when items get reset externally — to refocus barcode field */
  resetSignal?: number;
}

export function OrderItemsEditor({ items, onChange, resetSignal }: OrderItemsEditorProps) {
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeRef = useRef<InputRef>(null);

  useEffect(() => {
    if (resetSignal !== undefined) barcodeRef.current?.focus();
  }, [resetSignal]);

  const mergeItem = (item: {
    barcode: string;
    name: string;
    sellingPrice: number;
    costPrice: number;
    sellPriceCarton: number;
  }) => {
    const existing = items.find((i) => i.barcode === item.barcode);
    if (existing) {
      // สแกนซ้ำ = เพิ่มจำนวนแพ็ค 1
      onChange(items.map((i) => (i.barcode === item.barcode ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      onChange([...items, { ...item, quantity: 1, quantityCarton: 0 }]);
    }
  };

  const handleBarcodeSubmit = async () => {
    const barcode = barcodeInput.trim();
    if (!barcode) return;
    try {
      const res = await inventoryService.getByBarcode(barcode);
      const p = res.data.data;
      mergeItem({
        barcode: p.barcode,
        name: p.name,
        sellingPrice: p.sellPrice?.pack ?? p.sellPrice?.carton ?? 0,
        costPrice: p.costPrice?.pack ?? p.costPrice?.carton ?? 0,
        sellPriceCarton: p.sellPrice?.carton ?? 0,
      });
      setBarcodeInput('');
      barcodeRef.current?.focus();
    } catch (err) {
      notify.error('สแกน barcode ไม่สำเร็จ', getErrorMessage(err, `ไม่พบสินค้า barcode: ${barcode}`));
      barcodeRef.current?.focus();
    }
  };

  const handleDropdownSelect = (_: string, product: ProductDropdown) => {
    mergeItem({
      barcode: product.barcode,
      name: product.name,
      sellingPrice: product.sellPrice?.pack ?? product.sellPrice?.carton ?? 0,
      costPrice: 0, // cost price not available in dropdown-search lite shape
      sellPriceCarton: product.sellPrice?.carton ?? 0,
    });
  };

  const updateQty = (barcode: string, qty: number) => {
    const next = Math.max(0, qty);
    onChange(
      items.flatMap((i) => {
        if (i.barcode !== barcode) return [i];
        // ลบแถวเมื่อไม่เหลือทั้งแพ็คและลัง
        if (next <= 0 && !(i.quantityCarton && i.quantityCarton > 0)) return [];
        return [{ ...i, quantity: next }];
      }),
    );
  };

  const updateQtyCarton = (barcode: string, qty: number) => {
    onChange(
      items.map((i) => (i.barcode === barcode ? { ...i, quantityCarton: Math.max(0, qty) } : i)),
    );
  };

  const removeItem = (barcode: string) => {
    onChange(items.filter((i) => i.barcode !== barcode));
  };

  const rowTotal = (i: OrderItem) =>
    i.sellingPrice * i.quantity + (i.sellPriceCarton ?? 0) * (i.quantityCarton ?? 0);
  const totalQty = items.reduce((s, i) => s + i.quantity + (i.quantityCarton ?? 0), 0);
  const totalPrice = items.reduce((s, i) => s + rowTotal(i), 0);

  const columns: ColumnType<OrderItem>[] = [
    {
      title: 'สินค้า',
      key: 'product',
      render: (_: unknown, record: OrderItem) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.name}</div>
          <code className="text-[11px] text-foreground-subtle">{record.barcode}</code>
        </div>
      ),
    },
    {
      title: 'ราคา/แพ็ค',
      dataIndex: 'sellingPrice',
      width: 100,
      align: 'right',
      render: (v: number) => `฿${v?.toLocaleString()}`,
    },
    {
      title: 'แพ็ค',
      dataIndex: 'quantity',
      width: 96,
      align: 'center',
      render: (v: number, record: OrderItem) => (
        <InputNumber
          min={0}
          value={v}
          onChange={(val) => updateQty(record.barcode, val ?? 0)}
          style={{ width: 72 }}
          size="small"
        />
      ),
    },
    {
      title: 'ลัง',
      dataIndex: 'quantityCarton',
      width: 96,
      align: 'center',
      render: (v: number | undefined, record: OrderItem) => (
        <InputNumber
          min={0}
          value={v ?? 0}
          onChange={(val) => updateQtyCarton(record.barcode, val ?? 0)}
          style={{ width: 72 }}
          size="small"
        />
      ),
    },
    {
      title: 'รวม',
      key: 'total',
      width: 110,
      align: 'right',
      render: (_: unknown, record: OrderItem) => (
        <span style={{ fontWeight: 500 }}>฿{rowTotal(record).toLocaleString()}</span>
      ),
    },
    {
      title: '',
      key: 'del',
      width: 48,
      render: (_: unknown, record: OrderItem) => (
        <Button
          variant="danger"
          size="small"
          icon={<AppIcons.delete />}
          onClick={() => removeItem(record.barcode)}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
        <div style={{ flex: '1 1 320px' }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            เพิ่มสินค้าด้วย Barcode
          </div>
          <div className="flex w-full gap-2">
            <Input
              ref={barcodeRef}
              prefix={<AppIcons.barcode />}
              placeholder="สแกน หรือพิมพ์ barcode แล้วกด Enter"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onPressEnter={handleBarcodeSubmit}
              className="flex-1"
            />
            <Button variant="primary" icon={<AppIcons.add />} onClick={handleBarcodeSubmit}>
              เพิ่ม
            </Button>
          </div>
        </div>

        <div style={{ flex: '1 1 280px' }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            ค้นหาด้วยชื่อสินค้า
          </div>
          <ProductDropdownSelect
            style={{ width: '100%' }}
            placeholder="พิมพ์ชื่อหรือบาร์โค้ดเพื่อค้นหา"
            onSelect={handleDropdownSelect}
            value={undefined}
          />
        </div>
      </div>

      <Table<OrderItem>
        rowKey="barcode"
        columns={columns}
        dataSource={items}
        pagination={false}
        size="small"
        locale={{ emptyText: 'ยังไม่มีสินค้า — สแกน/พิมพ์ barcode หรือค้นหาด้านบน' }}
      />

      {items.length > 0 && (
        <div className="mt-3 flex justify-end gap-6 rounded-md bg-muted px-4 py-2.5">
          <span>
            จำนวนรวม: <Tag status="info">{totalQty} หน่วย</Tag>
          </span>
          <span>
            ยอดรวม:{' '}
            <strong style={{ fontSize: 15 }}>฿{totalPrice.toLocaleString()}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
