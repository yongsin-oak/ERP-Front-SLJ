import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ProductDropdownSelect, productRefQuery } from '@features/inventory';
import type { ProductDropdown } from '@features/inventory';
import { getErrorMessage, notify } from '@shared';
import { AppIcons } from '@/lib/icons';
import { cn } from '@/lib/utils';
import {
  btn,
  btnIcon,
  INPUT,
  LABEL,
  statusPill,
  TABLE,
  TABLE_EMPTY,
  TABLE_TD,
  TABLE_TH,
  TABLE_TR,
  TABLE_WRAP,
} from '@/lib/styles';
import type { OrderItem } from '../types';

interface OrderItemsEditorProps {
  items: OrderItem[];
  onChange: (items: OrderItem[]) => void;
  /** trigger when items get reset externally — to refocus barcode field */
  resetSignal?: number;
}

/**
 * ปุ่ม −/+ คู่กับช่องตัวเลข — หน้านี้ Operator ใช้ยืนบนพื้นที่ร้านทั้งกะ
 * ปุ่มจึงสูง 44px (h-11) ตาม UX bar ไม่ใช่ขนาด control ปกติ
 */
function QtyStepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        aria-label={`ลด${label}`}
        className={cn(btnIcon('secondary'), 'size-11')}
        onClick={() => onChange(Math.max(0, value - 1))}
      >
        <AppIcons.minus />
      </button>
      <input
        type="number"
        min={0}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className={cn(INPUT, 'h-11 w-16 px-2 text-center font-mono tabular-nums')}
      />
      <button
        type="button"
        aria-label={`เพิ่ม${label}`}
        className={cn(btnIcon('secondary'), 'size-11')}
        onClick={() => onChange(value + 1)}
      >
        <AppIcons.add />
      </button>
    </div>
  );
}

export function OrderItemsEditor({ items, onChange, resetSignal }: OrderItemsEditorProps) {
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeRef = useRef<HTMLInputElement>(null);
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
      notify.error(
        'สแกน barcode ไม่สำเร็จ',
        getErrorMessage(err, `ไม่พบสินค้า barcode: ${barcode}`),
      );
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

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="min-w-80 flex-1">
          <label htmlFor="order-barcode" className={cn(LABEL, 'mb-1.5 block')}>
            เพิ่มสินค้าด้วย Barcode
          </label>
          <div className="flex w-full gap-2">
            <div className="relative flex-1">
              <AppIcons.barcode className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-foreground-muted" />
              <input
                id="order-barcode"
                ref={barcodeRef}
                className={cn(INPUT, 'pl-9')}
                placeholder="สแกน หรือพิมพ์ barcode แล้วกด Enter"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleBarcodeSubmit();
                  }
                }}
              />
            </div>
            <button
              type="button"
              className={btn('primary')}
              onClick={() => void handleBarcodeSubmit()}
            >
              <AppIcons.add />
              เพิ่ม
            </button>
          </div>
        </div>

        <div className="min-w-70 flex-1">
          <label htmlFor="order-product-search" className={cn(LABEL, 'mb-1.5 block')}>
            ค้นหาด้วยชื่อสินค้า
          </label>
          <ProductDropdownSelect
            id="order-product-search"
            placeholder="พิมพ์ชื่อหรือบาร์โค้ดเพื่อค้นหา"
            onSelect={handleDropdownSelect}
            value={undefined}
          />
        </div>
      </div>

      <div className={TABLE_WRAP}>
        <table className={TABLE}>
          <thead>
            <tr>
              <th className={TABLE_TH}>สินค้า</th>
              <th className={cn(TABLE_TH, 'w-42 text-center')}>แพ็ค</th>
              <th className={cn(TABLE_TH, 'w-42 text-center')}>ลัง</th>
              <th className={cn(TABLE_TH, 'w-14')}>
                <span className="sr-only">ลบรายการ</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ?
              <tr>
                <td colSpan={4} className={TABLE_EMPTY}>
                  ยังไม่มีสินค้า — สแกน/พิมพ์ barcode หรือค้นหาด้านบน
                </td>
              </tr>
            : items.map((record) => (
                <tr key={record.barcode} className={TABLE_TR}>
                  <td className={TABLE_TD}>
                    <div className="font-medium">{record.name}</div>
                    <code className="text-[11px] text-foreground-subtle">{record.barcode}</code>
                  </td>
                  <td className={cn(TABLE_TD, 'text-center')}>
                    <QtyStepper
                      label="จำนวนแพ็ค"
                      value={record.quantity}
                      onChange={(val) => updateQty(record.barcode, val)}
                    />
                  </td>
                  <td className={cn(TABLE_TD, 'text-center')}>
                    <QtyStepper
                      label="จำนวนลัง"
                      value={record.quantityCarton ?? 0}
                      onChange={(val) => updateQtyCarton(record.barcode, val)}
                    />
                  </td>
                  <td className={TABLE_TD}>
                    <button
                      type="button"
                      aria-label="ลบรายการนี้"
                      className={btnIcon('danger')}
                      onClick={() => removeItem(record.barcode)}
                    >
                      <AppIcons.delete />
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {items.length > 0 && (
        <div className="mt-3 flex justify-end rounded-md bg-surface-200 px-4 py-2.5 text-sm">
          <span className="flex items-center gap-2">
            จำนวนรวม: <span className={statusPill('info')}>{totalQty} หน่วย</span>
          </span>
        </div>
      )}
    </div>
  );
}
