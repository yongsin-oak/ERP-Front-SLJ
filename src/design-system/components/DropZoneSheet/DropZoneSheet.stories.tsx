import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DropZoneSheet } from './index';
import type { SheetData } from './index';

const meta = {
  title: 'Design System/DropZoneSheet',
  component: DropZoneSheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'พื้นที่ลากไฟล์มาวางหรือคลิกเลือก แล้ว parse เป็น SheetData — รองรับเฉพาะไฟล์ .xlsx, .xls, .csv เท่านั้น (นามสกุลอื่นจะแสดงข้อความผิดพลาด)',
      },
    },
  },
  args: {
    onParsed: (data) => console.log('parsed', data),
  },
} satisfies Meta<typeof DropZoneSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

const InteractiveDemo = () => {
  const [parsed, setParsed] = useState<SheetData | null>(null);
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <DropZoneSheet onParsed={setParsed} onClear={() => setParsed(null)} />
      {parsed && (
        <div className="rounded-md border border-border bg-muted p-3 text-sm text-foreground">
          <div className="font-medium">onParsed ได้รับข้อมูล</div>
          <div className="mt-1 text-muted-foreground">
            ไฟล์: {parsed.fileName} · {parsed.totalRows.toLocaleString()} แถว
          </div>
          <div className="text-muted-foreground">คอลัมน์: {parsed.headers.join(', ')}</div>
        </div>
      )}
    </div>
  );
};

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'ลากไฟล์ .xlsx/.xls/.csv จริงมาวาง — component จะแสดงพรีวิว 5 แถวแรก และข้อมูลที่ callback ได้รับจะแสดงในกล่องด้านล่าง',
      },
    },
  },
  render: () => <InteractiveDemo />,
};

export const Disabled: Story = {
  args: { disabled: true },
};

const WARN_ROWS_LOW = 10;

export const WarnManyRows: Story = {
  parameters: {
    docs: {
      description: {
        story: 'ตั้ง warnRows=10 — ถ้าไฟล์ที่อัพโหลดมีมากกว่า 10 แถว จะขึ้นคำเตือนว่าการนำเข้าอาจใช้เวลานาน',
      },
    },
  },
  args: { warnRows: WARN_ROWS_LOW },
};
