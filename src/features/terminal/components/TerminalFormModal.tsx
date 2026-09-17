import { useEffect, useState } from 'react';
import { Dialog, Select, Switch } from 'radix-ui';
import { Controller, useForm } from 'react-hook-form';
import { AppIcons } from '@/lib/icons';
import { cn } from '@/lib/utils';
import {
  btn,
  btnIcon,
  DIALOG_CLOSE_X,
  DIALOG_CONTENT,
  DIALOG_FOOTER,
  DIALOG_OVERLAY,
  DIALOG_TITLE,
  FIELD_ERROR,
  FIELD_ROW,
  INPUT,
  LABEL,
  SELECT_CONTENT,
  SELECT_ITEM,
  SELECT_TRIGGER,
  SELECT_VIEWPORT,
  SWITCH,
  SWITCH_THUMB,
} from '@/lib/styles';
import type { Role } from '@features/auth/types';
import type { Terminal, CreateTerminalDto, UpdateTerminalDto } from '../types';

const ALL_ROLES: Role[] = [
  'SuperAdmin', 'Admin', 'Operator', 'Warehouse',
  'Accountant', 'HR', 'Marketing', 'Sales',
];

const MIN_PASSWORD_LENGTH = 8;

interface Props {
  open: boolean;
  terminal: Terminal | null;
  onClose: () => void;
  onSubmit: (values: CreateTerminalDto | UpdateTerminalDto) => Promise<void>;
  loading?: boolean;
}

type FormValues = {
  terminalCode: string;
  name: string;
  role: Role;
  password?: string;
  isActive?: boolean;
};

const EMPTY = {
  terminalCode: '',
  name: '',
  role: undefined,
  password: '',
  isActive: true,
} as unknown as FormValues;

export function TerminalFormModal({ open, terminal, onClose, onSubmit, loading }: Props) {
  const isEdit = !!terminal;
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: EMPTY });

  // เติมค่าเดิมทุกครั้งที่เปิด — ดูเหตุผลใน BrandFormModal
  // (การซ่อนรหัสผ่านรีเซ็ตตอนปิดใน onOpenChange ไม่ใช่ที่นี่ — เป็นผลของการกด ไม่ใช่ของข้อมูล)
  useEffect(() => {
    if (!open) return;
    reset(
      terminal ?
        {
          terminalCode: terminal.terminalCode,
          name: terminal.name,
          role: terminal.role,
          isActive: terminal.isActive,
          password: '',
        }
      : EMPTY,
    );
  }, [open, terminal, reset]);

  async function handleFinish(values: FormValues) {
    // แก้ไขแล้วไม่กรอกรหัสผ่าน = ไม่เปลี่ยนรหัส — ต้องไม่ส่ง field ไปเลย ไม่ใช่ส่งค่าว่าง
    if (isEdit && !values.password) {
      const rest: UpdateTerminalDto = {
        terminalCode: values.terminalCode,
        name: values.name,
        role: values.role,
        isActive: values.isActive,
      };
      await onSubmit(rest);
      return;
    }
    await onSubmit(values);
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        if (o) return;
        setShowPassword(false);
        onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={DIALOG_OVERLAY} />
        <Dialog.Content className={DIALOG_CONTENT} aria-describedby={undefined}>
          <Dialog.Title className={DIALOG_TITLE}>
            {isEdit ? 'แก้ไข Terminal' : 'เพิ่ม Terminal'}
          </Dialog.Title>
          <Dialog.Close asChild>
            <button type="button" aria-label="ปิด" className={DIALOG_CLOSE_X}>
              <AppIcons.close />
            </button>
          </Dialog.Close>

          <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit(handleFinish)}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className={FIELD_ROW}>
                <label htmlFor="terminal-code" className={LABEL}>
                  Terminal Code
                </label>
                <input
                  id="terminal-code"
                  className={INPUT}
                  placeholder="เช่น POS-01"
                  autoComplete="off"
                  aria-invalid={!!errors.terminalCode}
                  {...register('terminalCode', {
                    required: 'กรุณากรอก Terminal Code',
                    pattern: {
                      value: /^[A-Za-z0-9_-]+$/,
                      message: 'อนุญาต A-Z, 0-9, -, _ เท่านั้น',
                    },
                  })}
                />
                {errors.terminalCode && (
                  <span className={FIELD_ERROR}>{errors.terminalCode.message}</span>
                )}
              </div>

              <div className={FIELD_ROW}>
                <label htmlFor="terminal-name" className={LABEL}>
                  ชื่อ Terminal
                </label>
                <input
                  id="terminal-name"
                  className={INPUT}
                  placeholder="เช่น POS หน้าร้าน 1"
                  aria-invalid={!!errors.name}
                  {...register('name', { required: 'กรุณากรอกชื่อ' })}
                />
                {errors.name && <span className={FIELD_ERROR}>{errors.name.message}</span>}
              </div>
            </div>

            <div className={FIELD_ROW}>
              <label htmlFor="terminal-role" className={LABEL}>
                บทบาท
              </label>
              <Controller
                control={control}
                name="role"
                rules={{ required: 'กรุณาเลือกบทบาท' }}
                render={({ field }) => (
                  <Select.Root value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger
                      id="terminal-role"
                      ref={field.ref}
                      aria-invalid={!!errors.role}
                      className={SELECT_TRIGGER}
                    >
                      <Select.Value placeholder="เลือกบทบาท" />
                      <Select.Icon>
                        <AppIcons.chevronDown />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content position="popper" sideOffset={4} className={SELECT_CONTENT}>
                        <Select.Viewport className={SELECT_VIEWPORT}>
                          {ALL_ROLES.map((r) => (
                            <Select.Item key={r} value={r} className={SELECT_ITEM}>
                              <Select.ItemText>{r}</Select.ItemText>
                              <Select.ItemIndicator className="absolute right-2 text-primary">
                                <AppIcons.check />
                              </Select.ItemIndicator>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                )}
              />
              {errors.role && <span className={FIELD_ERROR}>{errors.role.message}</span>}
            </div>

            <div className={FIELD_ROW}>
              <label htmlFor="terminal-password" className={LABEL}>
                {isEdit ? 'รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)' : 'รหัสผ่าน'}
              </label>
              <div className="relative">
                <input
                  id="terminal-password"
                  type={showPassword ? 'text' : 'password'}
                  className={cn(INPUT, 'pr-10')}
                  placeholder={isEdit ? 'เว้นว่างถ้าไม่เปลี่ยน' : 'รหัสผ่านอย่างน้อย 8 ตัว'}
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  {...register('password', {
                    required: isEdit ? false : 'กรุณากรอกรหัสผ่าน',
                    minLength: {
                      value: MIN_PASSWORD_LENGTH,
                      message: `ต้องมีอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`,
                    },
                  })}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  onClick={() => setShowPassword((s) => !s)}
                  className={cn(btnIcon('ghost', 'sm'), 'absolute top-1/2 right-0.5 -translate-y-1/2')}
                >
                  <AppIcons.view />
                </button>
              </div>
              {errors.password && <span className={FIELD_ERROR}>{errors.password.message}</span>}
            </div>

            {isEdit && (
              <div className={FIELD_ROW}>
                <span className={LABEL}>สถานะ</span>
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => (
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <Switch.Root
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        className={SWITCH}
                      >
                        <Switch.Thumb className={SWITCH_THUMB} />
                      </Switch.Root>
                      <span className="text-sm text-foreground-light">
                        {field.value ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                      </span>
                    </label>
                  )}
                />
              </div>
            )}

            <div className={DIALOG_FOOTER}>
              <button type="button" className={btn('ghost')} onClick={onClose} disabled={loading}>
                ยกเลิก
              </button>
              <button type="submit" className={btn('primary')} disabled={loading}>
                {loading && <AppIcons.loading spin />}
                {isEdit ? 'บันทึก' : 'เพิ่ม Terminal'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
