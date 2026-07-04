import type { Meta, StoryObj } from '@storybook/react-vite';
import { SheetTable } from './index';
import type { SheetData } from '../DropZoneSheet';

// ── Shared mock data ──────────────────────────────────────────────────────────

const HEADERS = ['SKU', 'ชื่อสินค้า', 'หมวดหมู่', 'ราคา', 'สต็อก'];
const BOX_SIZES = ['00', '0', '0+4', 'A', 'AA', 'B', 'C', 'D', '2A'];
const CATEGORIES = ['กล่องไปรษณีย์', 'ซองกันกระแทก', 'เทปกาว'];
const BASE_PRICE = 45;
const PRICE_STEP = 10;

function makeSheetData(rowCount: number, fileName = 'products-import.xlsx'): SheetData {
  const rows = Array.from({ length: rowCount }, (_, i) => ({
    SKU: `BOX-${String(i + 1).padStart(3, '0')}`,
    ชื่อสินค้า: `กล่องไปรษณีย์ เบอร์ ${BOX_SIZES[i % BOX_SIZES.length]} (แพ็ก 20 ใบ)`,
    หมวดหมู่: CATEGORIES[i % CATEGORIES.length],
    ราคา: BASE_PRICE + (i % BOX_SIZES.length) * PRICE_STEP,
    สต็อก: (i * 17) % 300,
  }));
  return { fileName, headers: [...HEADERS], rows, totalRows: rows.length };
}

const SHEET_50 = makeSheetData(50);
const SHEET_5000 = makeSheetData(5000, 'products-full-export.xlsx');

const IMPORT_ERRORS: Record<number, string[]> = {
  2: ['ราคาต้องเป็นตัวเลขมากกว่า 0'],
  7: ['SKU ซ้ำกับแถวที่ 3', 'ไม่มีชื่อสินค้า'],
  15: ['ไม่พบหมวดหมู่ "กล่องพัสดุพิเศษ" ในระบบ'],
  31: ['สต็อกต้องไม่ติดลบ'],
};

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Design System/SheetTable',
  component: SheetTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { data: SHEET_50 },
} satisfies Meta<typeof SheetTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  parameters: { docs: { description: { story: 'พรีวิวไฟล์นำเข้าสินค้า 50 แถว — แถว render แบบ virtual ภายในตัวเอง' } } },
};

export const WithErrors: Story = {
  parameters: {
    docs: {
      description: {
        story: 'แถวที่ validate ไม่ผ่าน (index 2, 7, 15, 31) จะไฮไลต์สีแดง — ชี้เมาส์ที่เลขแถวเพื่อดูรายละเอียดข้อผิดพลาด',
      },
    },
  },
  args: { errors: IMPORT_ERRORS },
};

export const ManyRowsVirtualized: Story = {
  parameters: {
    docs: { description: { story: 'ไฟล์ export ทั้งคลัง 5,000 แถว — เลื่อนลื่นเพราะ render เฉพาะแถวที่มองเห็น' } },
  },
  args: { data: SHEET_5000 },
};

export const CompactHeight: Story = {
  parameters: { docs: { description: { story: 'กำหนด maxHeight=240 สำหรับพื้นที่จำกัด เช่นใน modal ขนาดเล็ก' } } },
  args: { maxHeight: 240 },
};
