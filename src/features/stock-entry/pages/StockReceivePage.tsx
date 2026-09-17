import { useState } from 'react';
import { Select } from 'radix-ui';
import { ProductDropdownSelect } from '@features/inventory';
import { AppIcons } from '@/lib/icons';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  btn,
  btnIcon,
  INPUT_NUMBER,
  PAGE_HEADER,
  PAGE_SUBTITLE,
  PAGE_TITLE,
  SELECT_CONTENT,
  SELECT_ITEM,
  SELECT_TRIGGER,
  SELECT_VIEWPORT,
  TABLE,
  TABLE_TD,
  TABLE_TH,
  TABLE_TR,
  TABLE_WRAP,
  TEXT,
} from '@/lib/styles';
import { EntryMetaBar } from '../components/EntryMetaBar';
import { useBulkCreateStockEntry } from '../react-query';

type ReceiveType = 'in' | 'return';

const RECEIVE_TYPE_LABEL: Record<ReceiveType, string> = {
  in: 'รับสินค้าเข้า',
  return: 'รับคืน',
};

interface ReceiveRow {
  key: string;
  productBarcode: string;
  type: ReceiveType;
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

  function updateRow(key: string, patch: Partial<ReceiveRow>) {
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

  return (
    <div>
      <div className={`${PAGE_HEADER} mb-4`}>
        <div className="min-w-0">
          <h1 className={PAGE_TITLE}>รับสินค้าเข้าคลัง</h1>
          <p className={PAGE_SUBTITLE}>บันทึกการรับสินค้าหลายรายการพร้อมกัน</p>
        </div>
      </div>

      <div className="max-w-250">
        <EntryMetaBar
          employeeId={employeeId}
          note={note}
          onEmployeeChange={setEmployeeId}
          onNoteChange={setNote}
        />

        <div className={TABLE_WRAP}>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={cn(TABLE_TH, 'min-w-55')}>สินค้า</th>
                <th className={cn(TABLE_TH, 'w-33')}>ประเภท</th>
                <th className={cn(TABLE_TH, 'w-33')}>จำนวน (แพ็ค)</th>
                <th className={cn(TABLE_TH, 'w-38')}>ราคาทุน/แพ็ค (฿)</th>
                <th className={cn(TABLE_TH, 'w-28 text-right')}>มูลค่า</th>
                <th className={cn(TABLE_TH, 'w-13')}>
                  <span className="sr-only">ลบแถว</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className={TABLE_TR}>
                  <td className={TABLE_TD}>
                    <ProductDropdownSelect
                      placeholder="เลือกสินค้า"
                      allowClear
                      value={r.productBarcode || undefined}
                      onChange={(v) =>
                        updateRow(
                          r.key,
                          v ?
                            { productBarcode: v }
                          : { productBarcode: '', costPricePerUnit: undefined },
                        )
                      }
                      onSelect={(barcode, product) =>
                        updateRow(r.key, {
                          productBarcode: barcode,
                          costPricePerUnit: product.costPrice?.pack ?? undefined,
                        })
                      }
                    />
                  </td>
                  <td className={TABLE_TD}>
                    <Select.Root
                      value={r.type}
                      onValueChange={(v) => updateRow(r.key, { type: v as ReceiveType })}
                    >
                      <Select.Trigger className={SELECT_TRIGGER} aria-label="ประเภทการรับ">
                        <Select.Value />
                        <Select.Icon>
                          <AppIcons.chevronDown />
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content position="popper" sideOffset={4} className={SELECT_CONTENT}>
                          <Select.Viewport className={SELECT_VIEWPORT}>
                            {(Object.keys(RECEIVE_TYPE_LABEL) as ReceiveType[]).map((t) => (
                              <Select.Item key={t} value={t} className={SELECT_ITEM}>
                                <Select.ItemText>{RECEIVE_TYPE_LABEL[t]}</Select.ItemText>
                                <Select.ItemIndicator className="absolute right-2 text-primary">
                                  <AppIcons.check />
                                </Select.ItemIndicator>
                              </Select.Item>
                            ))}
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </td>
                  <td className={TABLE_TD}>
                    <input
                      type="number"
                      min={1}
                      aria-label="จำนวนแพ็ค"
                      value={r.quantity}
                      onChange={(e) => updateRow(r.key, { quantity: Number(e.target.value) || 1 })}
                      className={INPUT_NUMBER}
                    />
                  </td>
                  <td className={TABLE_TD}>
                    {r.type === 'in' ?
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        aria-label="ราคาทุนต่อแพ็ค"
                        value={r.costPricePerUnit ?? ''}
                        onChange={(e) =>
                          updateRow(r.key, {
                            costPricePerUnit: e.target.value === '' ? undefined : Number(e.target.value),
                          })
                        }
                        className={INPUT_NUMBER}
                      />
                    : <span className={TEXT.muted}>—</span>}
                  </td>
                  <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                    {r.type === 'in' && r.costPricePerUnit ?
                      formatMoney(r.quantity * r.costPricePerUnit)
                    : '-'}
                  </td>
                  <td className={TABLE_TD}>
                    <button
                      type="button"
                      aria-label="ลบแถวนี้"
                      className={btnIcon('dangerGhost', 'sm')}
                      onClick={() => removeRow(r.key)}
                      disabled={rows.length === 1}
                    >
                      <AppIcons.delete />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={btn()} onClick={() => setRows((p) => [...p, newRow()])}>
            <AppIcons.add />
            เพิ่มรายการ
          </button>
          <button
            type="button"
            className={btn('primary')}
            disabled={!canSave || bulkCreate.isPending}
            onClick={() => void handleSave()}
          >
            {bulkCreate.isPending && <AppIcons.loading spin />}
            บันทึกการรับสินค้า
          </button>
        </div>

        {validRows.length > 0 && (
          <div className="mt-4 rounded-md border border-success-border bg-success-bg px-4 py-2.5 text-sm text-foreground-light">
            สรุป: {validRows.length} รายการ · รวม {totalQty.toLocaleString()} แพ็ค
            {totalCost > 0 && ` · มูลค่ารับเข้า ${formatMoney(totalCost)}`}
          </div>
        )}
      </div>
    </div>
  );
}
