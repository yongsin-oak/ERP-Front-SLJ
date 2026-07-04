import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppIcons } from '../../icons';
import { Button } from '../Button';
import { Drawer, type DrawerProps } from './index';

const meta = {
  title: 'Design System/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

type Placement = NonNullable<DrawerProps['placement']>;

const PLACEMENT_LABEL: Record<Placement, string> = {
  right: 'ขวา (ค่าเริ่มต้น)',
  left: 'ซ้าย',
  top: 'บน',
  bottom: 'ล่าง',
};

const PlacementsDemo = () => {
  const [placement, setPlacement] = useState<Placement | null>(null);
  const vertical = placement === 'top' || placement === 'bottom';
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(PLACEMENT_LABEL) as Placement[]).map((p) => (
        <Button key={p} onClick={() => setPlacement(p)}>
          เปิดจาก{PLACEMENT_LABEL[p]}
        </Button>
      ))}
      <Drawer
        open={placement !== null}
        onClose={() => setPlacement(null)}
        placement={placement ?? 'right'}
        height={vertical ? 260 : undefined}
        title="รายละเอียดสินค้า"
      >
        <div className="flex flex-col gap-2 text-sm">
          <p>
            <strong>กล่องไปรษณีย์ เบอร์ 0 (SLJ-BOX-0001)</strong>
          </p>
          <p className="text-muted-foreground">สต็อกคงเหลือ 1,250 ชิ้น · คลังสำเพ็ง 2</p>
          <p className="text-muted-foreground">
            Drawer นี้เปิดจากด้าน “{placement ? PLACEMENT_LABEL[placement] : ''}”
          </p>
        </div>
      </Drawer>
    </div>
  );
};

export const Placements: Story = { render: () => <PlacementsDemo /> };

const WithFooterAndExtraDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="primary" icon={<AppIcons.edit />} onClick={() => setOpen(true)}>
        แก้ไขออเดอร์ Lazada
      </Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="ออเดอร์ #LZ-240702-0198"
        extra={
          <Button variant="ghost" size="small" icon={<AppIcons.refresh />}>
            ซิงก์ใหม่
          </Button>
        }
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="primary" icon={<AppIcons.save />} onClick={() => setOpen(false)}>
              บันทึกการแก้ไข
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3 text-sm">
          <p>รายการสินค้าในออเดอร์:</p>
          <ul className="list-disc pl-5 text-muted-foreground">
            <li>ซองไปรษณีย์พลาสติก 28×42 ซม. × 5 แพ็ก</li>
            <li>เทปกาวใส 2 นิ้ว 100 หลา × 2 ม้วน</li>
            <li>กล่องไปรษณีย์ เบอร์ 2B × 20 ใบ</li>
          </ul>
          <p className="text-muted-foreground">
            ส่วนหัวมีปุ่ม extra (“ซิงก์ใหม่”) และส่วนท้ายเป็น footer สำหรับปุ่มบันทึก
          </p>
        </div>
      </Drawer>
    </>
  );
};

export const WithFooterAndExtra: Story = { render: () => <WithFooterAndExtraDemo /> };

const NarrowMobileDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button icon={<AppIcons.filter />} onClick={() => setOpen(true)}>
        ตัวกรองสต็อก (จอแคบ)
      </Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        width={320}
        title="ตัวกรอง"
        footer={
          <Button variant="primary" block onClick={() => setOpen(false)}>
            ใช้ตัวกรอง
          </Button>
        }
      >
        <div className="flex flex-col gap-3 text-sm">
          <p className="text-muted-foreground">ความกว้าง 320px — ใกล้เคียงหน้าจอมือถือ</p>
          <div>
            <p className="mb-1 font-medium">คลังสินค้า</p>
            <p className="text-muted-foreground">สำเพ็ง 2 · คลองถม · วงเวียนใหญ่</p>
          </div>
          <div>
            <p className="mb-1 font-medium">ช่องทางขาย</p>
            <p className="text-muted-foreground">หน้าร้าน · Shopee · Lazada</p>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export const NarrowMobile: Story = { render: () => <NarrowMobileDemo /> };
