import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { StatsCard } from '../StatsCard';
import { Text } from '../Typography';
import { AppIcons } from '../../icons';
import { Grid } from './index';

const Box = ({ children }: { children: ReactNode }) => (
  <div className="rounded-md border border-border bg-muted px-3 py-4 text-center text-sm text-foreground">
    {children}
  </div>
);

const meta = {
  title: 'Design System/Grid',
  component: Grid,
  tags: ['autodocs'],
  argTypes: {
    cols: { control: 'select', options: [1, 2, 3, 4, 6] },
    gap: { control: 'select', options: [0, 1, 2, 3, 4, 5, 6, 8] },
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    cols: 3,
    gap: 4,
    children: (
      <>
        <Box>สบู่สมุนไพรขมิ้น</Box>
        <Box>แชมพูอัญชัน 250ml</Box>
        <Box>น้ำยาล้างจานมะนาว</Box>
        <Box>ครีมอาบน้ำมะขาม</Box>
        <Box>ยาสีฟันสมุนไพร</Box>
        <Box>น้ำยาปรับผ้านุ่ม</Box>
      </>
    ),
  },
};

export const ResponsiveCols: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <p className="m-0 text-sm text-muted-foreground">
        ลองย่อ/ขยายความกว้าง viewport — มือถือเริ่มที่ 1 คอลัมน์ (cols=6 เริ่มที่ 2)
        แล้วจำนวนคอลัมน์ขยายตาม breakpoint sm / lg จนถึงค่า cols ที่กำหนด
      </p>
      {([2, 3, 4, 6] as const).map(cols => (
        <div key={cols} className="flex flex-col gap-2">
          <Text size="xs" type="secondary">cols={cols}</Text>
          <Grid cols={cols} gap={3}>
            {Array.from({ length: cols }, (_, i) => (
              <Box key={i}>คลัง {i + 1}</Box>
            ))}
          </Grid>
        </div>
      ))}
    </div>
  ),
};

export const GapVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {([2, 4, 8] as const).map(gap => (
        <div key={gap} className="flex flex-col gap-2">
          <Text size="xs" type="secondary">gap={gap}</Text>
          <Grid cols={3} gap={gap}>
            <Box>Shopee</Box>
            <Box>Lazada</Box>
            <Box>หน้าร้าน</Box>
          </Grid>
        </div>
      ))}
    </div>
  ),
};

export const StatCardGrid: Story = {
  render: () => (
    <Grid cols={4} gap={4}>
      <StatsCard
        label="ยอดขายวันนี้"
        value="48,250"
        prefix="฿"
        delta={12.4}
        deltaLabel="เทียบกับเมื่อวาน"
        icon={<AppIcons.baht />}
      />
      <StatsCard
        label="ออเดอร์วันนี้"
        value={156}
        suffix="ออเดอร์"
        delta={5.2}
        deltaLabel="เทียบกับเมื่อวาน"
        icon={<AppIcons.orders />}
      />
      <StatsCard
        label="ออเดอร์ Shopee"
        value={89}
        delta={-2.1}
        deltaLabel="เทียบกับเมื่อวาน"
        icon={<AppIcons.cart />}
      />
      <StatsCard
        label="สินค้าใกล้หมด"
        value={12}
        suffix="รายการ"
        icon={<AppIcons.warning />}
      />
    </Grid>
  ),
};
