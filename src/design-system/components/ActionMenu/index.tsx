import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { AppIcons } from '../../icons';

export interface ActionMenuItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** ถ้าคืน Promise โมดัลยืนยันจะขึ้น loading จนกว่าจะ settle */
  onSelect: () => void | Promise<unknown>;
  /** แสดงเป็นสีแดง — ตัวที่ danger ถูกดันไปท้ายเมนูและมีเส้นคั่นให้อัตโนมัติ */
  danger?: boolean;
  disabled?: boolean;
  /** ต้องยืนยันก่อนทำ — action ที่ย้อนกลับไม่ได้ต้องใส่เสมอ */
  confirm?: { title?: string; description?: React.ReactNode; okText?: string };
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  /** loading บนปุ่ม kebab (เช่นระหว่าง mutation ทำงาน) */
  loading?: boolean;
  disabled?: boolean;
  size?: 'small' | 'middle';
  /** ป้ายกำกับปุ่ม — ตั้งให้สื่อบริบทเมื่อมีหลายเมนูในหน้าเดียว */
  label?: string;
}

/**
 * ActionMenu — ยุบ action หลายปุ่มให้เหลือปุ่ม kebab เดียว
 *
 * ทำไมต้องยุบ: ปุ่มเรียงกันท้ายแถว table กินความกว้าง และทำให้ปุ่มลบโผล่อยู่ปลายนิ้ว
 * ทุกแถวตลอดเวลา — เมนูบังคับให้ต้องตั้งใจกดสองครั้ง และดัน danger ไปท้ายสุดเสมอ
 * ให้ห่างจากตัวที่กดบ่อย
 */
export function ActionMenu({
  items,
  loading = false,
  disabled = false,
  size = 'small',
  label = 'ตัวเลือกเพิ่มเติม',
}: ActionMenuProps) {
  const [open, setOpen] = React.useState(false);
  // แยก "ตัวที่รอยืนยัน" ออกจาก "โมดัลเปิดอยู่ไหม" เพื่อให้ข้อความในโมดัลไม่กระพริบ
  // กลับเป็นค่า default ระหว่าง animation ปิด
  const [confirming, setConfirming] = React.useState<ActionMenuItem | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  // danger ไปท้ายเสมอ ไม่ว่าผู้เรียกจะส่งมาลำดับไหน
  const ordered = [...items.filter((i) => !i.danger), ...items.filter((i) => i.danger)];
  const firstDangerIndex = ordered.findIndex((i) => i.danger);

  if (ordered.length === 0) return null;

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size={size}
            aria-label={label}
            icon={<AppIcons.more />}
            loading={loading}
            disabled={disabled}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          // กำลังจะเปิดโมดัลยืนยัน → อย่าคืน focus ให้ trigger ชนกับ focus trap ของโมดัล
          onCloseAutoFocus={(e) => {
            if (confirmOpen) e.preventDefault();
          }}
        >
          {ordered.map((item, i) => (
            <React.Fragment key={item.key}>
              {i === firstDangerIndex && i > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                variant={item.danger ? 'destructive' : 'default'}
                disabled={item.disabled}
                onSelect={(e) => {
                  if (!item.confirm) {
                    item.onSelect();
                    return;
                  }
                  // กัน Radix ปิดเมนูเอง แล้วสั่งปิดพร้อมเปิดโมดัลในจังหวะเดียวกัน
                  e.preventDefault();
                  setConfirming(item);
                  setConfirmOpen(true);
                  setOpen(false);
                }}
              >
                {item.icon}
                {item.label}
              </DropdownMenuItem>
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onOk={async () => {
          if (!confirming) return;
          try {
            await confirming.onSelect();
          } catch {
            // error ถูก toast โดย handleError ของ mutation แล้ว — ปิดโมดัลตามปกติ
          }
          setConfirmOpen(false);
        }}
        title={confirming?.confirm?.title ?? 'ยืนยันการทำรายการ'}
        okText={confirming?.confirm?.okText ?? 'ยืนยัน'}
        okButtonProps={{ danger: confirming?.danger }}
        width={420}
      >
        <p className="m-0 text-sm text-foreground-light">
          {confirming?.confirm?.description ?? 'ไม่สามารถยกเลิกการดำเนินการนี้ได้'}
        </p>
      </Modal>
    </>
  );
}
