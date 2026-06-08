import styled from '@emotion/styled';
import { Flex } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { colors, spacing, radius } from '../../tokens';
import { Button } from '../Button';
import { Text } from '../Typography';
import { DeleteConfirmButton } from '../DeleteConfirmButton';

export interface BulkSelectionBarProps {
  count: number;
  onDelete: () => void;
  onClear: () => void;
  isDeleting?: boolean;
  itemLabel?: string;
}

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing[2]} ${spacing[3]};
  background: ${colors.bg.hover};
  border-radius: ${radius.md};
  margin-bottom: ${spacing[3]};
`;

export function BulkSelectionBar({
  count,
  onDelete,
  onClear,
  isDeleting = false,
  itemLabel = 'items',
}: BulkSelectionBarProps) {
  return (
    <Bar>
      <Text size="sm" type="secondary">
        {count} {itemLabel} selected
      </Text>
      <Flex gap={spacing[2]}>
        <DeleteConfirmButton
          onConfirm={onDelete}
          loading={isDeleting}
          title={`Delete ${count} ${itemLabel}?`}
          description="This action cannot be undone."
          size="middle"
        >
          <Button variant="danger" icon={<DeleteOutlined />} loading={isDeleting}>
            Delete selected
          </Button>
        </DeleteConfirmButton>
        <Button variant="ghost" onClick={onClear} disabled={isDeleting}>
          Clear
        </Button>
      </Flex>
    </Bar>
  );
}
