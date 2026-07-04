import { Select, Input, Form, Inline } from '@design-system';

interface Props {
  employeeOptions: { label: string; value: string }[];
  employeeId: string | undefined;
  note: string;
  notePlaceholder?: string;
  onEmployeeChange: (id: string | undefined) => void;
  onNoteChange: (note: string) => void;
}

export function EntryMetaBar({
  employeeOptions,
  employeeId,
  note,
  notePlaceholder = 'หมายเหตุ (ถ้ามี)',
  onEmployeeChange,
  onNoteChange,
}: Props) {
  return (
    <Inline gap={3} align="end" wrap={false} className="mb-4">
      <Form.Item label="พนักงาน" style={{ marginBottom: 0 }}>
        <Select
          allowClear
          showSearch={{ optionFilterProp: 'label' }}
          placeholder="เลือกพนักงาน (ถ้ามี)"
          style={{ width: 200 }}
          options={employeeOptions}
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
