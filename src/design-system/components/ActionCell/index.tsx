import { Button } from '../Button';
import { DeleteConfirmButton } from '../DeleteConfirmButton';
import { AppIcons } from '../../icons';

export interface ActionCellProps {
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  deleteTitle?: string;
  deleteDescription?: string;
}

export function ActionCell({
  onEdit,
  onDelete,
  isDeleting = false,
  deleteTitle,
  deleteDescription,
}: ActionCellProps) {
  return (
    <div className="flex items-center gap-1">
      {onEdit && <Button variant="ghost" size="small" icon={<AppIcons.edit />} onClick={onEdit} />}
      {onDelete && (
        <DeleteConfirmButton
          onConfirm={onDelete}
          loading={isDeleting}
          title={deleteTitle}
          description={deleteDescription}
        />
      )}
    </div>
  );
}
