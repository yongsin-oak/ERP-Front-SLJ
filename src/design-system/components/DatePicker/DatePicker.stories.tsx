import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { DatePicker, DateRangePicker } from './index';
import type { RangeValue, DateRangePreset } from './index';

const meta = {
  title: 'Design System/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['small', 'middle', 'large'] },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDefaultValue: Story = {
  args: { defaultValue: dayjs() },
};

export const CustomFormat: Story = {
  args: { defaultValue: dayjs(), format: 'D MMM YYYY' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: dayjs() },
};

export const DisabledPastDates: Story = {
  args: {
    placeholder: 'เลือกวันนัดส่งสินค้า',
    disabledDate: (d: Dayjs) => d.isBefore(dayjs(), 'day'),
  },
};

const ControlledDemo = () => {
  const [date, setDate] = useState<Dayjs | null>(null);
  return (
    <div className="flex max-w-72 flex-col gap-2">
      <DatePicker value={date} onChange={(d) => setDate(d)} placeholder="วันที่รับสินค้าเข้าคลัง" />
      <span className="text-sm text-muted-foreground">
        {date ? `รับเข้าวันที่ ${date.format('DD/MM/YYYY')}` : 'ยังไม่เลือกวันที่'}
      </span>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

export const Sizes: Story = {
  render: () => (
    <div className="flex max-w-72 flex-col gap-2">
      <DatePicker size="small" placeholder="small" />
      <DatePicker size="middle" placeholder="middle" />
      <DatePicker size="large" placeholder="large" />
    </div>
  ),
};

// ── DateRangePicker ───────────────────────────────────────────────────────────
// หมายเหตุ: DateRangePicker แสดงผลจาก prop `value` เท่านั้น จึงต้องใช้แบบ controlled เสมอ

const RangeDemo = ({ presets }: { presets?: DateRangePreset[] }) => {
  const [range, setRange] = useState<RangeValue>(null);
  return (
    <div className="flex max-w-80 flex-col gap-2">
      <DateRangePicker value={range} onChange={(d) => setRange(d)} presets={presets} />
      <span className="text-sm text-muted-foreground">
        {range?.[0] && range?.[1]
          ? `ช่วงที่เลือก: ${range[0].format('DD/MM/YYYY')} – ${range[1].format('DD/MM/YYYY')}`
          : 'ยังไม่เลือกช่วงวันที่'}
      </span>
    </div>
  );
};

export const Range: Story = {
  render: () => <RangeDemo />,
};

export const RangeWithPresets: Story = {
  render: () => (
    <RangeDemo
      presets={[
        { label: 'วันนี้', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
        { label: '7 วันล่าสุด', value: [dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')] },
        { label: 'เดือนนี้', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
      ]}
    />
  ),
};

export const RangeDisabled: Story = {
  render: () => (
    <div className="max-w-80">
      <DateRangePicker disabled />
    </div>
  ),
};

const OrderFilterDemo = () => {
  const [range, setRange] = useState<RangeValue>([dayjs().startOf('month'), dayjs().endOf('day')]);
  const [shipDate, setShipDate] = useState<Dayjs | null>(dayjs().add(1, 'day'));
  return (
    <div className="max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-1 text-base font-semibold text-foreground">กรองออเดอร์ Shopee / Lazada</h3>
      <p className="mb-5 text-[13px] text-muted-foreground">
        เลือกช่วงวันที่สั่งซื้อและวันนัดส่งเพื่อดูรายการออเดอร์
      </p>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-foreground">ช่วงวันที่สั่งซื้อ</span>
          <DateRangePicker
            value={range}
            onChange={(d) => setRange(d)}
            presets={[
              { label: 'วันนี้', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
              { label: 'เดือนนี้', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
            ]}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-foreground">วันนัดส่งสินค้า</span>
          <DatePicker
            value={shipDate}
            onChange={(d) => setShipDate(d)}
            disabledDate={(d) => d.isBefore(dayjs(), 'day')}
          />
        </div>
      </div>
    </div>
  );
};

export const OrderFilterExample: Story = {
  render: () => <OrderFilterDemo />,
};
