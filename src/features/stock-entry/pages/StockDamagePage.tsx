import { useState } from 'react';
import { ProductDropdownSelect } from '@features/inventory';
import { AppIcons } from '@/lib/icons';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  alertBox,
  btn,
  btnIcon,
  INPUT_NUMBER,
  PAGE_HEADER,
  PAGE_SUBTITLE,
  PAGE_TITLE,
  TABLE,
  TABLE_TD,
  TABLE_TH,
  TABLE_TR,
  TABLE_WRAP,
  TEXT,
} from '@/lib/styles';
import { EntryMetaBar } from '../components/EntryMetaBar';
import { useBulkDamage } from '../react-query';

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

  return (
    <div>
      <div className={`${PAGE_HEADER} mb-4`}>
        <div className="min-w-0">
          <h1 className={PAGE_TITLE}>บันทึกของเสีย</h1>
          <p className={PAGE_SUBTITLE}>
            บันทึกสินค้าที่เสียหายหรือถูกทำลาย — สต็อกจะลดลงตามจำนวนที่กรอก
          </p>
        </div>
      </div>

      <div className={cn(alertBox('warning'), 'mb-4 max-w-250')}>
        <AppIcons.warning />
        <span>สต็อกจะลดลงทันที — กรุณาตรวจสอบจำนวนก่อนบันทึก</span>
      </div>

      <div className="max-w-250">
        <EntryMetaBar
          employeeId={employeeId}
          note={note}
          notePlaceholder="สาเหตุของเสีย เช่น สินค้าหมดอายุ, บรรจุภัณฑ์แตก"
          onEmployeeChange={setEmployeeId}
          onNoteChange={setNote}
        />

        <div className={TABLE_WRAP}>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={cn(TABLE_TH, 'min-w-60')}>สินค้า</th>
                <th className={cn(TABLE_TH, 'w-30 text-right')}>สต็อกปัจจุบัน</th>
                <th className={cn(TABLE_TH, 'w-33')}>จำนวนที่เสีย</th>
                <th className={cn(TABLE_TH, 'w-38')}>ราคาทุน/แพ็ค (฿)</th>
                <th className={cn(TABLE_TH, 'w-30 text-right')}>มูลค่าที่เสีย</th>
                <th className={cn(TABLE_TH, 'w-13')}>
                  <span className="sr-only">ลบแถว</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const overStock = r.currentRemaining != null && r.quantity > r.currentRemaining;
                return (
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
                    </td>
                    <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                      {r.currentRemaining != null ?
                        <span className={TEXT.muted}>{r.currentRemaining}</span>
                      : '-'}
                    </td>
                    <td className={TABLE_TD}>
                      <input
                        type="number"
                        min={1}
                        max={r.currentRemaining}
                        aria-label="จำนวนที่เสีย"
                        aria-invalid={overStock}
                        value={r.quantity}
                        onChange={(e) => updateRow(r.key, { quantity: Number(e.target.value) || 1 })}
                        className={INPUT_NUMBER}
                      />
                    </td>
                    <td className={TABLE_TD}>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        aria-label="ราคาทุนต่อแพ็ค"
                        value={r.costPricePerUnit || ''}
                        onChange={(e) =>
                          updateRow(r.key, { costPricePerUnit: Number(e.target.value) || 0 })
                        }
                        className={INPUT_NUMBER}
                      />
                    </td>
                    <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                      {r.costPricePerUnit ?
                        <span className="text-destructive">
                          {formatMoney(r.quantity * r.costPricePerUnit)}
                        </span>
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
                );
              })}
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
            className={btn('danger')}
            disabled={!canSave || bulkDamage.isPending}
            onClick={() => void handleSave()}
          >
            {bulkDamage.isPending && <AppIcons.loading spin />}
            บันทึกของเสีย
          </button>
        </div>

        {validRows.length > 0 && (
          <div className="mt-4 rounded-md border border-error-border bg-error-bg px-4 py-2.5 text-sm">
            สรุป: {validRows.length} รายการ · {totalQty.toLocaleString()} แพ็ค
            {totalLoss > 0 && (
              <span className="text-destructive"> · มูลค่าที่เสีย {formatMoney(totalLoss)}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
