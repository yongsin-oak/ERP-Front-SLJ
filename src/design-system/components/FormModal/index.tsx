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
    let values: T;
    try {
      values = await form.validateFields();
    } catch {
      return; // validation ไม่ผ่าน — RHF แสดง error ใต้ field แล้ว
    }
    try {
      await onFinish(values);
    } catch (err) {
      // mutation error ถูก toast โดย handleError แล้ว — log ไว้จับบัคที่ไม่คาดคิดใน dev
      if (import.meta.env.DEV) console.error('[FormModal] onFinish error:', err);
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
