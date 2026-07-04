import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppIcons } from '../../icons';
import { Button } from '../Button';
import { Tabs, type TabItem } from './index';

const ORDER_TABS: TabItem[] = [
  {
    key: 'all',
    label: 'ทั้งหมด (128)',
    children: <p className="text-sm text-muted-foreground">ออเดอร์ทุกช่องทาง 128 รายการ</p>,
  },
  {
    key: 'shopee',
    label: 'Shopee (86)',
    children: <p className="text-sm text-muted-foreground">ออเดอร์ Shopee ที่รอแพ็ก 86 รายการ</p>,
  },
  {
    key: 'lazada',
    label: 'Lazada (37)',
    children: <p className="text-sm text-muted-foreground">ออเดอร์ Lazada ที่รอแพ็ก 37 รายการ</p>,
  },
  {
    key: 'storefront',
    label: 'หน้าร้าน (5)',
    children: <p className="text-sm text-muted-foreground">บิลขายหน้าร้านสำเพ็ง 5 รายการ</p>,
  },
];

const meta = {
  title: 'Design System/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { items: ORDER_TABS },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Uncontrolled: Story = {
  args: { defaultActiveKey: 'shopee' },
};

const ControlledDemo = () => {
  const [activeKey, setActiveKey] = useState('all');
  return (
    <div className="flex flex-col gap-3">
      <Tabs items={ORDER_TABS} activeKey={activeKey} onChange={setActiveKey} />
      <p className="text-sm text-muted-foreground">
        แท็บที่เลือก (state ภายนอก): <code>{activeKey}</code>
      </p>
      <div className="flex gap-2">
        <Button size="small" onClick={() => setActiveKey('lazada')}>
          สลับไป Lazada ด้วยปุ่มภายนอก
        </Button>
        <Button size="small" onClick={() => setActiveKey('all')}>
          กลับไปทั้งหมด
        </Button>
      </div>
    </div>
  );
};

export const Controlled: Story = { render: () => <ControlledDemo /> };

export const WithDisabledTab: Story = {
  args: {
    items: [
      ...ORDER_TABS,
      {
        key: 'cancelled',
        label: 'ยกเลิก (ปิดปรับปรุง)',
        disabled: true,
        children: <p className="text-sm text-muted-foreground">รายการที่ถูกยกเลิก</p>,
      },
    ],
    defaultActiveKey: 'all',
  },
};

export const WithExtraContent: Story = {
  args: {
    defaultActiveKey: 'all',
    tabBarExtraContent: (
      <Button variant="primary" size="small" icon={<AppIcons.add />}>
        สร้างออเดอร์
      </Button>
    ),
  },
};
