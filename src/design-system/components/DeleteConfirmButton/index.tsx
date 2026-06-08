import type { ReactNode } from 'react';
import { Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Button } from '../Button';

export interface DeleteConfirmButtonProps {
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  description?: string;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  children?: ReactNode;
}

export function DeleteConfirmButton({
  onConfirm,
  loading = false,
  title = 'Confirm delete',
  description = 'This action cannot be undone.',
  disabled = false,
  size = 'small',
  children,
}: DeleteConfirmButtonProps) {
  return (
    <Popconfirm
      title={title}
      description={description}
      onConfirm={onConfirm}
      okText="Delete"
      cancelText="Cancel"
      okButtonProps={{ danger: true, loading }}
      disabled={disabled}
    >
      {children ?? (
        <Button
          variant="danger-ghost"
          size={size}
          icon={<DeleteOutlined />}
          loading={loading}
          disabled={disabled}
        />
      )}
    </Popconfirm>
  );
}
