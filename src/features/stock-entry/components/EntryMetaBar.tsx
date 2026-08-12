import { Input, Form, Inline } from '@design-system';
import { EmployeeSearchSelect } from '@features/employee/components/EmployeeSearchSelect';

interface Props {
  employeeId: string | undefined;
  note: string;
  notePlaceholder?: string;
  onEmployeeChange: (id: string | undefined) => void;
  onNoteChange: (note: string) => void;
}

export function EntryMetaBar({
  employeeId,
  note,
  notePlaceholder = 'หมายเหตุ (ถ้ามี)',
  onEmployeeChange,
  onNoteChange,
}: Props) {
  return (
    <Inline gap={3} align="end" wrap={false} className="mb-4">
      <Form.Item label="พนักงาน" style={{ marginBottom: 0 }}>
        {/* ค้นหาฝั่ง server + โหลดทีละหน้า — ไม่ดึงพนักงานทั้งองค์กรมาไว้ในหน่วยความจำ */}
        <EmployeeSearchSelect
          allowClear
          placeholder="เลือกพนักงาน (ถ้ามี)"
          style={{ width: 200 }}
          value={employeeId}
          onChange={onEmployeeChange}
        />
      </Form.Item>
      <Form.Item label="หมายเหตุ" style={{ marginBottom: 0, flex: 1 }}>
        <Input
          placeholder={notePlaceholder}
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
        />
      </Form.Item>
    </Inline>
  );
}
