import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Input, QuantityStepper, Table, Tag, AppIcons } from '@design-system';
import type { ColumnType, InputRef } from '@design-system';
import { ProductDropdownSelect, productRefQuery } from '@features/inventory';
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
  const qc = useQueryClient();

  useEffect(() => {
    if (resetSignal !== undefined) barcodeRef.current?.focus();
  }, [resetSignal]);

  /** สแกนซ้ำ = เพิ่มจำนวนแพ็ค 1 */
  const bumpQuantity = (barcode: string) => {
    onChange(items.map((i) => (i.barcode === barcode ? { ...i, quantity: i.quantity + 1 } : i)));
  };

  const mergeItem = (item: { barcode: string; name: string }) => {
    if (items.some((i) => i.barcode === item.barcode)) bumpQuantity(item.barcode);
    else onChange([...items, { ...item, quantity: 1, quantityCarton: 0 }]);
  };

  const handleBarcodeSubmit = async () => {
    const barcode = barcodeInput.trim();
    if (!barcode) return;

    // สแกนซ้ำสินค้าที่อยู่ในบิลแล้ว → บวกจำนวนได้เลย ไม่ต้อง fetch
    // (ข้อมูลสินค้าอยู่ในแถวครบแล้ว + ยืนยันว่า barcode มีจริงตั้งแต่สแกนครั้งแรก)
    if (items.some((i) => i.barcode === barcode)) {
      bumpQuantity(barcode);
      setBarcodeInput('');
      barcodeRef.current?.focus();
      return;
    }

    try {
      // fetchQuery = อ่าน cache ถ้ายัง fresh, ยิง API ถ้าไม่มี/หมดอายุ, และ dedupe คำขอที่ซ้อนกัน
      const p = await qc.fetchQuery(productRefQuery(barcode));
      mergeItem({ barcode: p.barcode, name: p.name });
      setBarcodeInput('');
      barcodeRef.current?.focus();
    } catch (err) {
      notify.error('สแกน barcode ไม่สำเร็จ', getErrorMessage(err, `ไม่พบสินค้า barcode: ${barcode}`));
      barcodeRef.current?.focus();
    }
  };

  const handleDropdownSelect = (_: string, product: ProductDropdown) => {
    mergeItem({ barcode: product.barcode, name: product.name });
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

  const totalQty = items.reduce((s, i) => s + i.quantity + (i.quantityCarton ?? 0), 0);

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
      title: 'แพ็ค',
      dataIndex: 'quantity',
      width: 168,
      align: 'center',
      render: (v: number, record: OrderItem) => (
        <QuantityStepper
          size="large"
          label="จำนวนแพ็ค"
          value={v}
          onChange={(val) => updateQty(record.barcode, val)}
        />
      ),
    },
    {
      title: 'ลัง',
      dataIndex: 'quantityCarton',
      width: 168,
      align: 'center',
      render: (v: number | undefined, record: OrderItem) => (
        <QuantityStepper
          size="large"
          label="จำนวนลัง"
          value={v ?? 0}
          onChange={(val) => updateQtyCarton(record.barcode, val)}
        />
      ),
    },
    {
      title: '',
      key: 'del',
      width: 56,
      render: (_: unknown, record: OrderItem) => (
        <Button
          variant="danger"
          aria-label="ลบรายการนี้"
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
        <div className="mt-3 flex justify-end rounded-md bg-muted px-4 py-2.5">
          <span>
            จำนวนรวม: <Tag status="info">{totalQty} หน่วย</Tag>
          </span>
        </div>
      )}
    </div>
  );
}
