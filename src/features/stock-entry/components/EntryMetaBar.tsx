import { EmployeeSearchSelect } from '@features/employee/components/EmployeeSearchSelect';
import { FIELD_ROW, INPUT, LABEL } from '@/lib/styles';

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
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className={`${FIELD_ROW} sm:w-50`}>
        <label htmlFor="entry-employee" className={LABEL}>
          พนักงาน
        </label>
        {/* ค้นหาฝั่ง server + โหลดทีละหน้า — ไม่ดึงพนักงานทั้งองค์กรมาไว้ในหน่วยความจำ */}
        <EmployeeSearchSelect
          id="entry-employee"
          allowClear
          placeholder="เลือกพนักงาน (ถ้ามี)"
          value={employeeId}
          onChange={onEmployeeChange}
        />
      </div>

      <div className={`${FIELD_ROW} flex-1`}>
        <label htmlFor="entry-note" className={LABEL}>
          หมายเหตุ
        </label>
        <input
          id="entry-note"
          className={INPUT}
          placeholder={notePlaceholder}
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
        />
      </div>
    </div>
  );
}
