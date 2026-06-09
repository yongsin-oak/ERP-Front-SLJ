import { SheetImportModal } from '@design-system';
import type { DbFieldDef } from '@design-system';
import { useBulkCreateEmployees } from '../react-query';
import { DepartmentOptions } from '../types';
import type { Department, CreateEmployeeDto } from '../types';

const DB_FIELDS: DbFieldDef[] = [
  { key: 'firstName',   label: 'ชื่อจริง',        required: true, type: 'text' },
  { key: 'lastName',    label: 'นามสกุล',         required: true, type: 'text' },
  { key: 'nickname',    label: 'ชื่อเล่น',        required: true, type: 'text' },
  { key: 'department',  label: 'แผนก',            required: true, type: 'text' },
  { key: 'phoneNumber', label: 'โทรศัพท์',         type: 'text' },
  { key: 'startDate',   label: 'วันที่เริ่มงาน',   type: 'date' },
];

const DEPT_LOOKUP = new Map<string, Department>(DepartmentOptions.map((o) => [o.value, o.value]));
const VALID_DEPT_LIST = DepartmentOptions.map((o) => o.value).join(', ');

function validateRow(row: Record<string, unknown>): string[] {
  const errs: string[] = [];
  if (!row['firstName'] || String(row['firstName']).trim() === '') errs.push('ชื่อจริงห้ามว่าง');
  if (!row['lastName'] || String(row['lastName']).trim() === '') errs.push('นามสกุลห้ามว่าง');
  if (!row['nickname'] || String(row['nickname']).trim() === '') errs.push('ชื่อเล่นห้ามว่าง');
  const dept = String(row['department'] ?? '').trim();
  if (!dept) {
    errs.push('แผนกห้ามว่าง');
  } else if (!DEPT_LOOKUP.has(dept)) {
    errs.push(`แผนก "${dept}" ไม่ถูกต้อง (ค่าที่รับได้: ${VALID_DEPT_LIST})`);
  }
  return errs;
}

function transformRow(row: Record<string, unknown>): CreateEmployeeDto {
  const dept = DEPT_LOOKUP.get(String(row['department'] ?? '').trim());
  if (!dept) throw new Error(`Invalid department: ${String(row['department'])}`);

  return {
    firstName: String(row['firstName'] ?? '').trim(),
    lastName: String(row['lastName'] ?? '').trim(),
    nickname: String(row['nickname'] ?? '').trim(),
    department: dept,
    ...(row['phoneNumber'] ? { phoneNumber: String(row['phoneNumber']).trim() } : {}),
    ...(row['startDate'] ? { startDate: String(row['startDate']).trim() } : {}),
  };
}

interface EmployeeImportModalProps {
  open: boolean;
  onClose: () => void;
}

export function EmployeeImportModal({ open, onClose }: EmployeeImportModalProps) {
  const bulkCreate = useBulkCreateEmployees();

  return (
    <SheetImportModal<CreateEmployeeDto>
      open={open}
      onClose={onClose}
      title="นำเข้าพนักงานจาก Excel / CSV"
      dbFields={DB_FIELDS}
      validateRow={validateRow}
      transformRow={transformRow}
      onImport={async (rows) => { await bulkCreate.mutateAsync(rows); }}
      loading={bulkCreate.isPending}
    />
  );
}
