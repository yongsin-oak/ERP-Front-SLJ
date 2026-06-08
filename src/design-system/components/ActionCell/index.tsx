import { Flex } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { spacing } from '../../tokens';
import { Button } from '../Button';
import { DeleteConfirmButton } from '../DeleteConfirmButton';

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
          icon={<EditOutlined />}
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
