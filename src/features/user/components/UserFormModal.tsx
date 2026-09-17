import { useEffect, useState } from 'react';
import { Dialog, Select } from 'radix-ui';
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
} from '@/lib/styles';
import type { Role } from '@features/auth/types';
import type { CreateUserDto } from '../types';

const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;

interface Props {
  open: boolean;
  roles: Role[];
  onClose: () => void;
  onSubmit: (values: CreateUserDto) => Promise<void>;
  loading?: boolean;
}

const EMPTY = { username: '', password: '', role: undefined } as unknown as CreateUserDto;

export function UserFormModal({ open, roles, onClose, onSubmit, loading }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserDto>({ defaultValues: EMPTY });

  // ล้างฟอร์มทุกครั้งที่เปิด — โมดัลนี้สร้างผู้ใช้อย่างเดียว ค่าที่ค้างจากรอบก่อนไม่ควรโผล่
  // (การซ่อนรหัสผ่านรีเซ็ตตอนปิดใน onOpenChange — เป็นผลของการกด ไม่ใช่ของข้อมูล)
  useEffect(() => {
    if (!open) return;
    reset(EMPTY);
  }, [open, reset]);

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
          <Dialog.Title className={DIALOG_TITLE}>เพิ่มผู้ใช้งาน</Dialog.Title>
          <Dialog.Close asChild>
            <button type="button" aria-label="ปิด" className={DIALOG_CLOSE_X}>
              <AppIcons.close />
            </button>
          </Dialog.Close>

          <form
            noValidate
            className="flex flex-col gap-4"
            onSubmit={handleSubmit((values) => onSubmit(values))}
          >
            <div className={FIELD_ROW}>
              <label htmlFor="user-username" className={LABEL}>
                Username
              </label>
              <input
                id="user-username"
                className={INPUT}
                placeholder="username"
                autoComplete="off"
                aria-invalid={!!errors.username}
                {...register('username', {
                  required: 'กรุณากรอก username',
                  minLength: {
                    value: MIN_USERNAME_LENGTH,
                    message: `ต้องมีอย่างน้อย ${MIN_USERNAME_LENGTH} ตัวอักษร`,
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_.-]+$/,
                    message: 'อนุญาต a-z, 0-9, _, -, . เท่านั้น',
                  },
                })}
              />
              {errors.username && <span className={FIELD_ERROR}>{errors.username.message}</span>}
            </div>

            <div className={FIELD_ROW}>
              <label htmlFor="user-password" className={LABEL}>
                Password
              </label>
              <div className="relative">
                <input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  className={cn(INPUT, 'pr-10')}
                  placeholder="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  {...register('password', {
                    required: 'กรุณากรอก password',
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

            <div className={FIELD_ROW}>
              <label htmlFor="user-role" className={LABEL}>
                บทบาท
              </label>
              <Controller
                control={control}
                name="role"
                rules={{ required: 'กรุณาเลือกบทบาท' }}
                render={({ field }) => (
                  <Select.Root value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger
                      id="user-role"
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
                          {roles.map((r) => (
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

            <div className={DIALOG_FOOTER}>
              <button type="button" className={btn('ghost')} onClick={onClose} disabled={loading}>
                ยกเลิก
              </button>
              <button type="submit" className={btn('primary')} disabled={loading}>
                {loading && <AppIcons.loading spin />}
                เพิ่มผู้ใช้งาน
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
