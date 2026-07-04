import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppIcons } from '../../icons';
import { Button } from '../Button';
import { Modal } from './index';

const meta = {
  title: 'Design System/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const BasicDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="primary" icon={<AppIcons.add />} onClick={() => setOpen(true)}>
        เพิ่มสินค้าใหม่
      </Button>
      <Modal
        open={open}
        title="เพิ่มสินค้าใหม่"
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
      >
        <p className="text-sm text-muted-foreground">
          กรอกข้อมูลสินค้าเพื่อเพิ่มเข้าคลัง SLJ Supply Center เช่น กล่องไปรษณีย์ เบอร์ 0
          ซองไปรษณีย์พลาสติก และเทปกาว
        </p>
      </Modal>
    </>
  );
};

export const Basic: Story = { render: () => <BasicDemo /> };

const AsyncOkDemo = () => {
  const [open, setOpen] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-start gap-3">
      <Button variant="primary" icon={<AppIcons.stockReceive />} onClick={() => setOpen(true)}>
        บันทึกรับสต็อกเข้า
      </Button>
      {savedAt && (
        <p className="text-sm text-success-text">บันทึกรับเข้าเรียบร้อยเมื่อ {savedAt}</p>
      )}
      <Modal
        open={open}
        title="ยืนยันรับสต็อกเข้า"
        okText="บันทึก"
        onCancel={() => setOpen(false)}
        onOk={async () => {
          await delay(1000);
          setSavedAt(new Date().toLocaleTimeString());
          setOpen(false);
        }}
      >
        <div className="flex flex-col gap-2 text-sm">
          <p>
            รับเข้า <strong>กล่องไปรษณีย์ เบอร์ 0 (SLJ-BOX-0001)</strong> จำนวน 500 ชิ้น
            เข้าคลังสำเพ็ง 2
          </p>
          <p className="text-muted-foreground">
            กดปุ่ม “บันทึก” แล้วสังเกต: onOk คืน Promise (~1 วินาที) → ปุ่มตกลงขึ้น loading
            อัตโนมัติ และระหว่างรอจะกด Escape / คลิกนอก modal / ปุ่ม X เพื่อปิดไม่ได้
          </p>
        </div>
      </Modal>
    </div>
  );
};

export const AsyncOk: Story = { render: () => <AsyncOkDemo /> };

const CustomFooterDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>ตรวจสอบออเดอร์ Shopee</Button>
      <Modal
        open={open}
        title="ออเดอร์ #SP-240701-0042"
        onCancel={() => setOpen(false)}
        footer={
          <div className="flex w-full items-center justify-between">
            <Button variant="danger-ghost" icon={<AppIcons.close />} onClick={() => setOpen(false)}>
              ปฏิเสธออเดอร์
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                ไว้ทีหลัง
              </Button>
              <Button variant="primary" icon={<AppIcons.check />} onClick={() => setOpen(false)}>
                ยืนยันแพ็กสินค้า
              </Button>
            </div>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          ลูกค้าสั่งซองไปรษณีย์พลาสติก 28×42 ซม. จำนวน 3 แพ็ก ผ่าน Shopee — ตรวจสอบสต็อกก่อนยืนยัน
        </p>
      </Modal>
    </>
  );
};

export const CustomFooter: Story = { render: () => <CustomFooterDemo /> };

const NoFooterDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button icon={<AppIcons.view />} onClick={() => setOpen(true)}>
        ดูรายละเอียดสินค้า
      </Button>
      <Modal open={open} title="รายละเอียดสินค้า" footer={null} onCancel={() => setOpen(false)}>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-muted-foreground">รหัสสินค้า</dt>
          <dd>SLJ-TAPE-0045</dd>
          <dt className="text-muted-foreground">ชื่อสินค้า</dt>
          <dd>เทปกาวใส 2 นิ้ว 100 หลา</dd>
          <dt className="text-muted-foreground">สต็อกคงเหลือ</dt>
          <dd>1,250 ม้วน</dd>
          <dt className="text-muted-foreground">คลัง</dt>
          <dd>สำเพ็ง 2</dd>
        </dl>
      </Modal>
    </>
  );
};

export const NoFooter: Story = { render: () => <NoFooterDemo /> };

const DangerDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="danger-ghost" icon={<AppIcons.delete />} onClick={() => setOpen(true)}>
        ลบสินค้า
      </Button>
      <Modal
        open={open}
        title="ลบสินค้าออกจากระบบ"
        okText="ลบสินค้า"
        okButtonProps={{ danger: true }}
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
      >
        <p className="text-sm">
          ต้องการลบ <strong>กล่องไปรษณีย์ เบอร์ 00 (SLJ-BOX-0000)</strong> ใช่หรือไม่?
          ประวัติการรับเข้า-จ่ายออกของสินค้านี้จะถูกซ่อนจากรายงาน และไม่สามารถย้อนกลับได้
        </p>
      </Modal>
    </>
  );
};

export const Danger: Story = { render: () => <DangerDemo /> };

const WideDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button icon={<AppIcons.excel />} onClick={() => setOpen(true)}>
        นำเข้าสินค้าจาก Excel
      </Button>
      <Modal
        open={open}
        width={880}
        title="ตรวจสอบข้อมูลก่อนนำเข้า (120 แถว)"
        okText="นำเข้าทั้งหมด"
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
      >
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-divider text-muted-foreground">
              <th className="py-2 font-medium">รหัสสินค้า</th>
              <th className="py-2 font-medium">ชื่อสินค้า</th>
              <th className="py-2 font-medium">หมวดหมู่</th>
              <th className="py-2 text-right font-medium">จำนวน</th>
              <th className="py-2 text-right font-medium">ราคาทุน</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-divider">
              <td className="py-2">SLJ-BOX-0001</td>
              <td className="py-2">กล่องไปรษณีย์ เบอร์ 0</td>
              <td className="py-2">กล่องพัสดุ</td>
              <td className="py-2 text-right">500</td>
              <td className="py-2 text-right">2.50</td>
            </tr>
            <tr className="border-b border-divider">
              <td className="py-2">SLJ-ENV-0102</td>
              <td className="py-2">ซองไปรษณีย์พลาสติก 28×42 ซม.</td>
              <td className="py-2">ซองพัสดุ</td>
              <td className="py-2 text-right">2,000</td>
              <td className="py-2 text-right">0.85</td>
            </tr>
            <tr>
              <td className="py-2">SLJ-TAPE-0045</td>
              <td className="py-2">เทปกาวใส 2 นิ้ว 100 หลา</td>
              <td className="py-2">เทปกาว</td>
              <td className="py-2 text-right">300</td>
              <td className="py-2 text-right">18.00</td>
            </tr>
          </tbody>
        </table>
      </Modal>
    </>
  );
};

export const Wide: Story = { render: () => <WideDemo /> };
