import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import dayjs from 'dayjs';
import { DeleteConfirmButton } from './index';
import { Button } from '../Button';
import { AppIcons } from '../../icons';

const meta = {
  title: 'Design System/DeleteConfirmButton',
  component: DeleteConfirmButton,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    onConfirm: () => console.log('confirmed'),
  },
} satisfies Meta<typeof DeleteConfirmButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

export const CustomText: Story = {
  args: {
    title: 'ลบ "กล่องไปรษณีย์ เบอร์ 0"?',
    description: 'สินค้าจะถูกลบออกจากคลังอย่างถาวร รวมถึงประวัติการรับเข้า-จ่ายออก',
    okText: 'ลบสินค้า',
    cancelText: 'เก็บไว้ก่อน',
  },
};

export const CustomTrigger: Story = {
  parameters: { docs: { description: { story: 'ส่ง children เพื่อใช้ปุ่มของตัวเองเป็น trigger แทนปุ่มไอคอนเริ่มต้น' } } },
  args: {
    title: 'ลบซัพพลายเออร์ "โรงงานกระดาษไทย จำกัด"?',
    children: (
      <Button variant="danger" icon={<AppIcons.delete />}>
        ลบซัพพลายเออร์
      </Button>
    ),
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

const ASYNC_DELETE_MS = 800;

const AsyncDemo = () => {
  const [lastDeletedAt, setLastDeletedAt] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-foreground">กล่องไปรษณีย์ เบอร์ 0 (แพ็ก 20 ใบ)</span>
        <DeleteConfirmButton
          title='ลบ "กล่องไปรษณีย์ เบอร์ 0"?'
          description="จำลองการเรียก API ลบสินค้า (~800ms)"
          onConfirm={() =>
            new Promise<void>((resolve) => {
              setTimeout(() => {
                setLastDeletedAt(dayjs().format('HH:mm:ss'));
                resolve();
              }, ASYNC_DELETE_MS);
            })
          }
        />
      </div>
      <div className="text-sm text-muted-foreground">
        {lastDeletedAt ? `ลบสำเร็จล่าสุดเมื่อ ${lastDeletedAt}` : 'ยังไม่มีการลบ'}
      </div>
    </div>
  );
};

export const AsyncConfirm: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'onConfirm คืน Promise — ปุ่ม "ลบ" ใน popover จะขึ้น loading ระหว่างรอ และปิด popover อัตโนมัติเมื่อ Promise settle',
      },
    },
  },
  render: () => <AsyncDemo />,
};
