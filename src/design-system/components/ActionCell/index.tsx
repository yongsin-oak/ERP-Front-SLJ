import { ActionMenu } from '../ActionMenu';
import type { ActionMenuItem } from '../ActionMenu';

export interface ActionCellProps {
  onEdit?: () => void | Promise<unknown>;
  /** คืน Promise ได้ — โมดัลยืนยันจะขึ้น loading จนกว่าจะ settle */
  onDelete?: () => void | Promise<unknown>;
  isDeleting?: boolean;
  deleteTitle?: string;
  deleteDescription?: string;
  /** action เพิ่มเติมของแถวนี้ — แสดงก่อน "แก้ไข" ตัวที่ danger จะถูกดันไปท้ายให้เอง */
  actions?: ActionMenuItem[];
}

/**
 * ActionCell — action ท้ายแถว table ในรูปเมนู kebab ปุ่มเดียว
 * ลำดับในเมนู: action เพิ่มเติม → แก้ไข → (เส้นคั่น) → ลบ (สีแดง ท้ายสุด)
 */
export function ActionCell({
  onEdit,
  onDelete,
  isDeleting = false,
  deleteTitle,
  deleteDescription,
  actions,
}: ActionCellProps) {
  const items: ActionMenuItem[] = [...(actions ?? [])];

  // ไม่ใส่ไอคอนโดยดีฟอลต์ — เมนูสั้นๆ อ่านจากข้อความเร็วกว่า และไอคอนครึ่งๆ กลางๆ
  // (บางแถวมี บางแถวไม่มี) ทำให้ข้อความไม่ตรงแนวกัน ผู้เรียกใส่เองได้ผ่าน `actions[].icon`
  if (onEdit) {
    items.push({ key: 'edit', label: 'แก้ไข', onSelect: onEdit });
  }

  if (onDelete) {
    items.push({
      key: 'delete',
      label: 'ลบ',
      onSelect: onDelete,
      danger: true,
      confirm: {
        title: deleteTitle ?? 'ยืนยันการลบ',
        description: deleteDescription ?? 'ไม่สามารถยกเลิกการดำเนินการนี้ได้',
        okText: 'ลบ',
      },
    });
  }

  return <ActionMenu items={items} loading={isDeleting} label="ตัวเลือกของแถวนี้" />;
}
