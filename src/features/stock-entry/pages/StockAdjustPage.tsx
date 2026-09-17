import { useState } from 'react';
import { ProductDropdownSelect } from '@features/inventory';
import { AppIcons } from '@/lib/icons';
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
import { useBulkAdjustStock } from '../react-query';

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

  return (
    <div>
      <div className={`${PAGE_HEADER} mb-4`}>
        <div className="min-w-0">
          <h1 className={PAGE_TITLE}>ปรับสต็อก (Stock Count)</h1>
          <p className={PAGE_SUBTITLE}>นับสต็อกจริงแล้วตั้งค่าทีเดียวหลายรายการ</p>
        </div>
      </div>

      <div className={cn(alertBox('warning'), 'mb-4 max-w-225')}>
        <AppIcons.warning />
        <span>การปรับสต็อกจะ set ค่าสต็อกเป็นตัวเลขที่กรอก ไม่ใช่บวกเพิ่ม</span>
      </div>

      <div className="max-w-225">
        <EntryMetaBar
          employeeId={employeeId}
          note={note}
          notePlaceholder="เช่น นับสต็อกประจำเดือน พ.ค. 2026"
          onEmployeeChange={setEmployeeId}
          onNoteChange={setNote}
        />

        <div className={TABLE_WRAP}>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={cn(TABLE_TH, 'min-w-65')}>สินค้า</th>
                <th className={cn(TABLE_TH, 'w-33 text-right')}>สต็อกปัจจุบัน</th>
                <th className={cn(TABLE_TH, 'w-40')}>จำนวนที่นับได้จริง</th>
                <th className={cn(TABLE_TH, 'w-23 text-right')}>ผลต่าง</th>
                <th className={cn(TABLE_TH, 'w-13')}>
                  <span className="sr-only">ลบแถว</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const diff = r.currentRemaining == null ? null : r.actualQuantity - r.currentRemaining;
                const mismatched = r.currentRemaining != null && r.actualQuantity !== r.currentRemaining;
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
                    </td>
                    <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                      {r.currentRemaining != null ?
                        <span className={TEXT.muted}>{r.currentRemaining}</span>
                      : '-'}
                    </td>
                    <td className={TABLE_TD}>
                      <input
                        type="number"
                        min={0}
                        aria-label="จำนวนที่นับได้จริง"
                        value={r.actualQuantity}
                        onChange={(e) =>
                          updateRow(r.key, { actualQuantity: Number(e.target.value) || 0 })
                        }
                        className={cn(
                          INPUT_NUMBER,
                          // เตือนด้วยขอบเมื่อค่าที่นับได้ไม่ตรงกับระบบ — จุดที่ต้องตรวจซ้ำก่อนบันทึก
                          mismatched && 'border-warning hover:border-warning focus-visible:border-warning',
                        )}
                      />
                    </td>
                    <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                      {diff == null ?
                        '-'
                      : diff === 0 ?
                        <span className={TEXT.muted}>0</span>
                      : <span className={diff > 0 ? 'text-success-text' : 'text-destructive'}>
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      }
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
            className={btn('primary')}
            disabled={!canSave || bulkAdjust.isPending}
            onClick={() => void handleSave()}
          >
            {bulkAdjust.isPending && <AppIcons.loading spin />}
            บันทึกการปรับสต็อก
          </button>
        </div>
      </div>
    </div>
  );
}
