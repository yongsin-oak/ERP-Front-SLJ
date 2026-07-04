import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SheetImportModal } from './index';
import type { DbFieldDef } from './index';
import { Button } from '../Button';
import { CodeCell } from '../TableCell';
import { AppIcons } from '../../icons';

// ── Shared mock config ────────────────────────────────────────────────────────

interface ProductImportRow {
  sku: string;
  name: string;
  price: number;
  stock: number;
}

const DB_FIELDS: DbFieldDef[] = [
  { key: 'sku', label: 'SKU', required: true },
  { key: 'name', label: 'ชื่อสินค้า', required: true, type: 'text' },
  { key: 'price', label: 'ราคา', type: 'number' },
  { key: 'stock', label: 'สต็อก', type: 'number' },
];

function validateRow(mapped: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (mapped.sku == null || String(mapped.sku).trim() === '') errors.push('ไม่มี SKU');
  if (mapped.name == null || String(mapped.name).trim() === '') errors.push('ไม่มีชื่อสินค้า');
  if (mapped.price != null && Number.isNaN(Number(mapped.price))) errors.push('ราคาต้องเป็นตัวเลข');
  return errors;
}

function transformRow(mapped: Record<string, unknown>): ProductImportRow {
  return {
    sku: String(mapped.sku ?? ''),
    name: String(mapped.name ?? ''),
    price: Number(mapped.price ?? 0),
    stock: Number(mapped.stock ?? 0),
  };
}

// ── Meta ──────────────────────────────────────────────────────────────────────
// SheetImportModal เป็น generic component — ใช้ Meta<typeof SheetImportModal> ตรง ๆ
// (satisfies ชนกับ generics)

const meta: Meta<typeof SheetImportModal> = {
  title: 'Design System/SheetImportModal',
  component: SheetImportModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Modal นำเข้าข้อมูล 3 ขั้นตอน: อัพโหลด → จับคู่คอลัมน์ → ตรวจสอบ — ขั้นแรกต้องเลือกไฟล์ .xlsx/.xls/.csv จริงเพื่อทดลอง flow ทั้งหมด',
      },
    },
  },
  args: {
    open: false,
    onClose: () => {},
    title: 'นำเข้าสินค้า',
    dbFields: DB_FIELDS,
    validateRow,
    transformRow,
    onImport: async () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

const FAKE_IMPORT_DELAY_MS = 900;

const ImportDemo = () => {
  const [open, setOpen] = useState(false);
  const [imported, setImported] = useState<ProductImportRow[] | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Button variant="primary" icon={<AppIcons.importFile />} onClick={() => setOpen(true)}>
          นำเข้าสินค้าจากไฟล์
        </Button>
      </div>

      <SheetImportModal<ProductImportRow>
        open={open}
        onClose={() => setOpen(false)}
        title="นำเข้าสินค้า"
        dbFields={DB_FIELDS}
        validateRow={validateRow}
        transformRow={transformRow}
        onImport={(rows) =>
          new Promise<void>((resolve) => {
            setTimeout(() => {
              setImported(rows);
              resolve();
            }, FAKE_IMPORT_DELAY_MS);
          })
        }
      />

      {imported && (
        <div className="rounded-md border border-border bg-muted p-3 text-sm">
          <div className="font-medium text-foreground">นำเข้าสำเร็จ {imported.length} รายการ</div>
          <ul className="mt-1 flex flex-col gap-0.5 text-muted-foreground">
            {imported.slice(0, 5).map((r) => (
              <li key={r.sku}>
                <CodeCell>{r.sku}</CodeCell> {r.name} — ฿{r.price.toLocaleString()} · {r.stock.toLocaleString()} ชิ้น
              </li>
            ))}
            {imported.length > 5 && <li>… และอีก {imported.length - 5} รายการ</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'กดปุ่มเพื่อเปิด modal แล้วอัพโหลดไฟล์สินค้า (.xlsx/.csv ที่มีคอลัมน์ SKU, ชื่อสินค้า, ราคา, สต็อก) — แถวที่ขาด SKU หรือชื่อสินค้าจะถูก validate ไม่ผ่านและข้ามตอนนำเข้า (จำลอง onImport ~900ms)',
      },
    },
  },
  render: () => <ImportDemo />,
};
