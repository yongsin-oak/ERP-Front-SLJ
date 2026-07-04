import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Button } from '../Button';
import { Text, Title } from '../Typography';
import { AppIcons } from '../../icons';
import { Inline, Stack } from './index';

const Box = ({ children }: { children: ReactNode }) => (
  <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
    {children}
  </div>
);

const meta = {
  title: 'Design System/Stack',
  component: Stack,
  tags: ['autodocs'],
  argTypes: {
    gap: { control: 'select', options: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch', 'baseline'] },
    justify: { control: 'select', options: ['start', 'center', 'end', 'between', 'around', 'evenly'] },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    gap: 3,
    children: (
      <>
        <Box>ยอดขายวันนี้ ฿48,250</Box>
        <Box>ออเดอร์ Shopee 89 รายการ</Box>
        <Box>ออเดอร์ Lazada 56 รายการ</Box>
      </>
    ),
  },
};

export const Gaps: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-8">
      {([1, 2, 4, 8] as const).map(gap => (
        <div key={gap} className="flex flex-col gap-2">
          <Text size="xs" type="secondary">gap={gap}</Text>
          <Stack gap={gap}>
            <Box>สินค้า</Box>
            <Box>สต็อก</Box>
            <Box>ยอดขาย</Box>
          </Stack>
        </div>
      ))}
    </div>
  ),
};

export const AlignVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-8">
      {(['start', 'center', 'end', 'stretch'] as const).map(align => (
        <div key={align} className="flex flex-col gap-2">
          <Text size="xs" type="secondary">align={align}</Text>
          <Stack gap={2} align={align} className="w-56 rounded-lg border border-dashed border-border p-3">
            <Box>Shopee</Box>
            <Box>Lazada</Box>
            <Box>หน้าร้าน</Box>
          </Stack>
        </div>
      ))}
    </div>
  ),
};

export const JustifyVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-8">
      {(['start', 'center', 'end', 'between'] as const).map(justify => (
        <div key={justify} className="flex flex-col gap-2">
          <Text size="xs" type="secondary">justify={justify}</Text>
          <Stack justify={justify} className="h-56 w-44 rounded-lg border border-dashed border-border p-3">
            <Box>รับเข้า</Box>
            <Box>เบิกออก</Box>
          </Stack>
        </div>
      ))}
    </div>
  ),
};

export const InlineRow: Story = {
  render: () => (
    <Inline gap={2}>
      <Button variant="primary" icon={<AppIcons.add />}>เพิ่มสินค้า</Button>
      <Button variant="secondary" icon={<AppIcons.importFile />}>นำเข้า Excel</Button>
      <Button variant="ghost" icon={<AppIcons.exportFile />}>ส่งออก</Button>
    </Inline>
  ),
};

export const InlineWrapNarrow: Story = {
  render: () => (
    <div className="w-80 rounded-lg border border-dashed border-border p-3">
      <Inline gap={2}>
        <Box>Shopee</Box>
        <Box>Lazada</Box>
        <Box>TikTok Shop</Box>
        <Box>หน้าร้านศรีลิ้นจี่</Box>
        <Box>ตัวแทนจำหน่าย</Box>
      </Inline>
    </div>
  ),
};

export const NestedLayout: Story = {
  render: () => (
    <Stack gap={4} className="max-w-2xl">
      <Inline justify="between">
        <Title level={4}>แดชบอร์ดยอดขาย</Title>
        <Inline gap={2}>
          <Button variant="secondary" icon={<AppIcons.exportFile />}>ส่งออก Excel</Button>
          <Button variant="primary" icon={<AppIcons.add />}>สร้างออเดอร์</Button>
        </Inline>
      </Inline>

      <Inline gap={3} align="stretch">
        <Box>ยอดขายวันนี้ ฿48,250</Box>
        <Box>ออเดอร์ Shopee 89</Box>
        <Box>ออเดอร์ Lazada 56</Box>
      </Inline>

      <Stack gap={2}>
        <Box>SLJ-0001 · สบู่สมุนไพรขมิ้น · คงเหลือ 320 ชิ้น</Box>
        <Box>SLJ-0002 · แชมพูอัญชัน 250ml · คงเหลือ 145 ชิ้น</Box>
        <Box>SLJ-0003 · น้ำยาล้างจานมะนาว · คงเหลือ 12 ชิ้น</Box>
      </Stack>
    </Stack>
  ),
};
