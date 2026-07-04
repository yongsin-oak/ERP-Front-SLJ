import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import dayjs from 'dayjs';
import { DateRangePresets } from './index';
import type { DateRangeValue } from './index';
import type { DateRangePreset } from '../DatePicker';

const meta = {
  title: 'Design System/DateRangePresets',
  component: DateRangePresets,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'DateRangePicker พร้อมชุด preset ภาษาไทยมาตรฐาน (วันนี้ / สัปดาห์นี้ / เดือนนี้ / 3 เดือน / ปีนี้) — แสดงผลจาก prop `value` เท่านั้น จึงต้องใช้แบบ controlled',
      },
    },
  },
} satisfies Meta<typeof DateRangePresets>;

export default meta;
type Story = StoryObj<typeof meta>;

const Demo = (props: { extraPresets?: DateRangePreset[]; customPresets?: DateRangePreset[] }) => {
  const [range, setRange] = useState<DateRangeValue>(null);
  return (
    <div className="flex max-w-80 flex-col gap-2">
      <DateRangePresets value={range} onChange={(d) => setRange(d)} {...props} />
      <span className="text-sm text-muted-foreground">
        {range?.[0] && range?.[1]
          ? `ช่วงที่เลือก: ${range[0].format('DD/MM/YYYY')} – ${range[1].format('DD/MM/YYYY')}`
          : 'ยังไม่เลือกช่วงวันที่'}
      </span>
    </div>
  );
};

export const Default: Story = {
  render: () => <Demo />,
};

export const ExtraPresets: Story = {
  render: () => (
    <Demo
      extraPresets={[
        {
          label: '7 วันล่าสุด',
          value: [dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')],
        },
        {
          label: 'ไตรมาสนี้',
          value: [dayjs().startOf('month').subtract(2, 'month'), dayjs().endOf('month')],
        },
      ]}
    />
  ),
};

export const CustomPresets: Story = {
  render: () => (
    <Demo
      customPresets={[
        {
          label: 'รอบบิลนี้',
          value: [dayjs().startOf('month'), dayjs().endOf('month')],
        },
        {
          label: 'รอบบิลก่อน',
          value: [
            dayjs().subtract(1, 'month').startOf('month'),
            dayjs().subtract(1, 'month').endOf('month'),
          ],
        },
      ]}
    />
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="max-w-80">
      <DateRangePresets {...args} />
    </div>
  ),
};

const SalesReportDemo = () => {
  const [range, setRange] = useState<DateRangeValue>([
    dayjs().startOf('month'),
    dayjs().endOf('day'),
  ]);
  const hasRange = range?.[0] != null && range?.[1] != null;
  return (
    <div className="max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-1 text-base font-semibold text-foreground">สรุปยอดขายตามช่องทาง</h3>
      <p className="mb-4 text-[13px] text-muted-foreground">
        {hasRange
          ? `ข้อมูลช่วง ${range?.[0]?.format('DD/MM/YYYY')} – ${range?.[1]?.format('DD/MM/YYYY')}`
          : 'เลือกช่วงวันที่เพื่อดูรายงาน'}
      </p>
      <DateRangePresets value={range} onChange={(d) => setRange(d)} />
      <div className="mt-4 flex flex-col gap-2 border-t border-divider pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shopee</span>
          <span className="font-medium tabular-nums">128,450.00 บาท</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Lazada</span>
          <span className="font-medium tabular-nums">86,720.00 บาท</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">หน้าร้าน</span>
          <span className="font-medium tabular-nums">42,310.00 บาท</span>
        </div>
      </div>
    </div>
  );
};

export const SalesReportExample: Story = {
  render: () => <SalesReportDemo />,
};
