import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';
import { Modal } from '../Modal';
import { Button } from '../Button';
import type { FormInstance } from '../Form';

export interface FormModalProps<T extends FieldValues = FieldValues> {
  open: boolean;
  onClose: () => void;
  title: string;
  form: FormInstance<T>;
  onFinish: (values: T) => void | Promise<void>;
  loading?: boolean;
  width?: number;
  submitLabel?: string;
  cancelLabel?: string;
  children: ReactNode;
}

export function FormModal<T extends FieldValues = FieldValues>({
  open,
  onClose,
  title,
  form,
  onFinish,
  loading = false,
  width,
  submitLabel = 'บันทึก',
  cancelLabel = 'ยกเลิก',
  children,
}: FormModalProps<T>) {
  useEffect(() => {
    if (!open) form.resetFields();
  }, [open, form]);

  async function handleSubmit() {
    try {
      const values = await form.validateFields();
      await onFinish(values);
    } catch {
      // RHF shows inline field errors — no additional handling needed
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={title}
      width={width}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {submitLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
