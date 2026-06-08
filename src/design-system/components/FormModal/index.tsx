import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Space } from 'antd';
import type { FormInstance } from 'antd';
import { Modal } from '../Modal';
import { Button } from '../Button';

export interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  form: FormInstance;
  onFinish: (values: unknown) => void | Promise<void>;
  loading?: boolean;
  width?: number;
  submitLabel?: string;
  children: ReactNode;
}

export function FormModal({
  open,
  onClose,
  title,
  form,
  onFinish,
  loading = false,
  width,
  submitLabel = 'Save',
  children,
}: FormModalProps) {
  useEffect(() => {
    if (!open) form.resetFields();
  }, [open, form]);

  async function handleSubmit() {
    try {
      const values = await form.validateFields();
      await onFinish(values);
    } catch {
      // antd shows inline field errors — no additional handling needed
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={title}
      width={width}
      footer={
        <Space>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {submitLabel}
          </Button>
        </Space>
      }
    >
      {children}
    </Modal>
  );
}
