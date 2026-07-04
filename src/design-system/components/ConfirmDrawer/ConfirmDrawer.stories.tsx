import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button';
import { Text } from '../Typography';
import { ConfirmDrawer } from './index';

const meta = {
  title: 'Design System/ConfirmDrawer',
  component: ConfirmDrawer,
  tags: ['autodocs'],
  args: {
    open: false,
    onClose: () => {},
    title: 'ปรับสต็อกหลายรายการ',
    formContent: null,
    summary: null,
    onConfirm: () => {},
  },
} satisfies Meta<typeof ConfirmDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const TwoStepDemo = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <div className="flex flex-col items-start gap-3">
      <Button
        variant="danger"
        onClick={() => {
          setDone(false);
          setOpen(true);
        }}
      >
        ลบสินค้าที่เลือก (50 รายการ)
      </Button>
      {done && <Text size="sm" type="success">ลบสินค้า 50 รายการเรียบร้อยแล้ว</Text>}
      <ConfirmDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="ลบสินค้าหลายรายการ"
        confirmTitle="ยืนยันการลบ 50 รายการ? การลบไม่สามารถย้อนกลับได้"
        confirmLabel="ลบทั้งหมด"
        loading={loading}
        formContent={
          <div className="flex flex-col gap-2 text-sm">
            <Text strong>รายการที่เลือกจากหน้าสินค้า</Text>
            <ul className="list-disc pl-5 text-muted-foreground">
              <li>กล่องไปรษณีย์ เบอร์ 00 — 12 รายการย่อย</li>
              <li>ซองไปรษณีย์พลาสติก (เลิกผลิต) — 30 รายการย่อย</li>
              <li>เทปกาวรุ่นเก่า — 8 รายการย่อย</li>
            </ul>
            <Text size="sm" type="secondary">
              ตรวจสอบรายการแล้วกด “ถัดไป” เพื่อไปหน้ายืนยัน
            </Text>
          </div>
        }
        summary={
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">จำนวนที่จะลบ</dt>
            <dd>50 รายการ</dd>
            <dt className="text-muted-foreground">คลังที่เกี่ยวข้อง</dt>
            <dd>สำเพ็ง 2, คลองถม</dd>
            <dt className="text-muted-foreground">ผลกระทบ</dt>
            <dd>รายการจะหายจาก Shopee / Lazada sync</dd>
          </dl>
        }
        onConfirm={async () => {
          setLoading(true);
          try {
            await delay(1000);
            setDone(true);
            setOpen(false);
          } finally {
            setLoading(false);
          }
        }}
      />
    </div>
  );
};

export const TwoStepFlow: Story = { render: () => <TwoStepDemo /> };

const RejectDemo = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failCount, setFailCount] = useState(0);
  return (
    <div className="flex flex-col items-start gap-3">
      <Button variant="primary" onClick={() => setOpen(true)}>
        ปรับสต็อกจากการนับจริง
      </Button>
      {failCount > 0 && (
        <Text size="sm" type="danger">
          ยืนยันล้มเหลว {failCount} ครั้ง — ปกติ error จะถูก toast โดย handleError ของ mutation
          และ drawer ค้างที่หน้ายืนยันให้กดซ้ำได้
        </Text>
      )}
      <ConfirmDrawer
        open={open}
        onClose={() => {
          setOpen(false);
          setFailCount(0);
        }}
        title="ปรับสต็อก — กล่องไปรษณีย์ เบอร์ 0"
        confirmTitle="ยืนยันปรับสต็อกจาก 1,250 → 1,180 ชิ้น?"
        confirmLabel="ยืนยันปรับสต็อก"
        loading={loading}
        formContent={
          <div className="flex flex-col gap-2 text-sm">
            <Text strong>ผลการนับสต็อกจริง (คลังสำเพ็ง 2)</Text>
            <p className="text-muted-foreground">ระบบ: 1,250 ชิ้น · นับได้จริง: 1,180 ชิ้น · ส่วนต่าง: -70 ชิ้น</p>
            <Text size="sm" type="secondary">
              เดโมนี้ตั้งใจให้ onConfirm โยน error หลังหน่วง ~1 วินาที เพื่อพิสูจน์ว่า drawer
              ยังค้างอยู่ที่หน้ายืนยัน (ไม่รีเซ็ตกลับ step แรก)
            </Text>
          </div>
        }
        summary={
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">สินค้า</dt>
            <dd>SLJ-BOX-0001</dd>
            <dt className="text-muted-foreground">ปรับจาก</dt>
            <dd>1,250 ชิ้น</dd>
            <dt className="text-muted-foreground">ปรับเป็น</dt>
            <dd>1,180 ชิ้น</dd>
            <dt className="text-muted-foreground">เหตุผล</dt>
            <dd>นับสต็อกประจำเดือน</dd>
          </dl>
        }
        onConfirm={async () => {
          setLoading(true);
          try {
            await delay(1000);
            setFailCount((c) => c + 1);
            throw new Error('สต็อกถูกแก้ไขโดยผู้ใช้อื่นระหว่างการยืนยัน');
          } finally {
            setLoading(false);
          }
        }}
      />
    </div>
  );
};

export const ConfirmRejects: Story = { render: () => <RejectDemo /> };
