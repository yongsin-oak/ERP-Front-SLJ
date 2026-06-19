import { Flex } from 'antd';
import { spacing } from '../../tokens';
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
    <Flex gap={spacing[1]} align="center">
      {onEdit && (
        <Button
          variant="ghost"
          size="small"
          icon={<AppIcons.edit />}
          onClick={onEdit}
        />
      )}
      {onDelete && (
        <DeleteConfirmButton
          onConfirm={onDelete}
          loading={isDeleting}
          title={deleteTitle}
          description={deleteDescription}
        />
      )}
    </Flex>
  );
}
