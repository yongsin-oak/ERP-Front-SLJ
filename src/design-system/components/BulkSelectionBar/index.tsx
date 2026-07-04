import { Button } from '../Button';
import { Text } from '../Typography';
import { DeleteConfirmButton } from '../DeleteConfirmButton';
import { AppIcons } from '../../icons';

export interface BulkSelectionBarProps {
  count: number;
  onDelete: () => void;
  onClear: () => void;
  isDeleting?: boolean;
  itemLabel?: string;
  deleteTitle?: string;
}

export function BulkSelectionBar({
  count,
  onDelete,
  onClear,
  isDeleting = false,
  itemLabel = 'รายการ',
  deleteTitle,
}: BulkSelectionBarProps) {
  return (
    <div className="mb-3 flex items-center justify-between rounded-md bg-accent px-3 py-2">
      <Text size="sm" type="secondary">
        เลือก {count} {itemLabel}
      </Text>
      <div className="flex gap-2">
        <DeleteConfirmButton
          onConfirm={onDelete}
          loading={isDeleting}
          title={deleteTitle ?? `ลบ ${count} ${itemLabel} ที่เลือก?`}
          size="middle"
        >
          <Button variant="danger" icon={<AppIcons.delete />} loading={isDeleting}>
            ลบที่เลือก
          </Button>
        </DeleteConfirmButton>
        <Button variant="ghost" onClick={onClear} disabled={isDeleting}>
          ยกเลิก
        </Button>
      </div>
    </div>
  );
}
