import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionMenu } from './index';

const meta = {
  title: 'Design System/Actions/ActionMenu',
  component: ActionMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'ยุบ action หลายปุ่มให้เหลือปุ่มสามจุดปุ่มเดียว — item ที่ `danger: true` ถูกดันไปท้ายพร้อมเส้นคั่นเสมอ ' +
          'ไม่ว่าจะส่งมาลำดับไหน · ใส่ `confirm` แล้วจะเปิดโมดัลยืนยันให้เอง · ' +
          'ใช้ `ActionCell` แทนถ้าเป็น action ท้ายแถวตาราง (มันห่อ ActionMenu ไว้ให้แล้ว)',
      },
    },
  },
} satisfies Meta<typeof ActionMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { key: 'view', label: 'ดูรายละเอียด', onSelect: () => console.log('view') },
      { key: 'duplicate', label: 'ทำสำเนา', onSelect: () => console.log('duplicate') },
      { key: 'edit', label: 'แก้ไข', onSelect: () => console.log('edit') },
    ],
  },
};

export const WithDanger: Story = {
  parameters: {
    docs: {
      description: {
        story: '`danger` ส่งมาเป็นตัวแรก แต่ component ดันไปท้ายให้เอง — ผู้เรียกไม่ต้องคุมลำดับ',
      },
    },
  },
  args: {
    items: [
      {
        key: 'delete',
        label: 'ลบใบสั่งซื้อ',
        danger: true,
        onSelect: () => console.log('delete'),
        confirm: { title: 'ลบใบสั่งซื้อนี้?', description: 'สต็อกที่ตัดไปแล้วจะไม่ถูกคืนอัตโนมัติ', okText: 'ลบ' },
      },
      { key: 'view', label: 'ดูรายละเอียด', onSelect: () => console.log('view') },
      { key: 'print', label: 'พิมพ์ใบเสร็จ', onSelect: () => console.log('print') },
    ],
  },
};

export const WithDisabled: Story = {
  args: {
    items: [
      { key: 'view', label: 'ดูรายละเอียด', onSelect: () => console.log('view') },
      { key: 'approve', label: 'อนุมัติ (ต้องเป็นหัวหน้า)', disabled: true, onSelect: () => {} },
      {
        key: 'void',
        label: 'ยกเลิกบิล',
        danger: true,
        onSelect: () => console.log('void'),
        confirm: { title: 'ยกเลิกบิลนี้?' },
      },
    ],
  },
};

export const AsyncConfirm: Story = {
  parameters: {
    docs: {
      description: {
        story: '`onSelect` คืน Promise → ปุ่มยืนยันในโมดัลขึ้น loading และกันกดซ้ำจนกว่าจะ settle',
      },
    },
  },
  args: {
    items: [
      { key: 'view', label: 'ดูรายละเอียด', onSelect: () => console.log('view') },
      {
        key: 'delete',
        label: 'ลบ',
        danger: true,
        onSelect: () => new Promise((resolve) => setTimeout(resolve, 1500)),
        confirm: { title: 'ลบรายการนี้?', okText: 'ลบ' },
      },
    ],
  },
};

export const Loading: Story = {
  parameters: {
    docs: { description: { story: 'loading=true — ปุ่ม kebab ขึ้นสถานะระหว่าง mutation ของแถวนั้นทำงาน' } },
  },
  args: {
    loading: true,
    items: [{ key: 'view', label: 'ดูรายละเอียด', onSelect: () => console.log('view') }],
  },
};
