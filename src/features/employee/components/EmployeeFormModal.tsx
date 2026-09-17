import { useEffect } from 'react';
import { Dialog, Select, Switch } from 'radix-ui';
import { Controller, useForm } from 'react-hook-form';
import { AppIcons } from '@/lib/icons';
import {
  btn,
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
import { DepartmentOptions } from '../types';
import type { Employee, CreateEmployeeDto } from '../types';

interface Props {
  open: boolean;
  employee?: Employee | null;
  onClose: () => void;
  onSubmit: (values: CreateEmployeeDto) => Promise<void>;
  loading?: boolean;
}

/**
 * `startDate` เก็บเป็นสตริง YYYY-MM-DD ตรงกับที่ backend รับ
 * (เดิมเก็บเป็น dayjs object แล้วแปลงตอน submit — ตัวเลือกวันที่ตอนนี้เป็น
 * `<input type="date">` ซึ่งให้ค่าเป็นรูปแบบนี้อยู่แล้ว ไม่ต้องแปลงกลับไปกลับมา)
 */
const EMPTY = {
  firstName: '',
  lastName: '',
  nickname: '',
  phoneNumber: undefined,
  department: undefined,
  startDate: undefined,
  isActive: true,
} as unknown as CreateEmployeeDto;

export function EmployeeFormModal({ open, employee, onClose, onSubmit, loading }: Props) {
  const isEdit = !!employee;
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEmployeeDto>({ defaultValues: EMPTY });

  // เติมค่าเดิมทุกครั้งที่เปิด — ดูเหตุผลใน BrandFormModal
  useEffect(() => {
    if (!open) return;
    reset(
      employee ?
        {
          firstName: employee.firstName,
          lastName: employee.lastName,
          nickname: employee.nickname,
          phoneNumber: employee.phoneNumber ?? undefined,
          department: employee.department,
          isActive: employee.isActive,
          // backend คืนวันที่มาเป็น ISO — <input type="date"> รับแค่ส่วน YYYY-MM-DD
          startDate: employee.startDate ? employee.startDate.slice(0, 10) : undefined,
        }
      : EMPTY,
    );
  }, [open, employee, reset]);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={DIALOG_OVERLAY} />
        <Dialog.Content className={DIALOG_CONTENT} aria-describedby={undefined}>
          <Dialog.Title className={DIALOG_TITLE}>
            {isEdit ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงาน'}
          </Dialog.Title>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className={FIELD_ROW}>
                <label htmlFor="emp-firstname" className={LABEL}>
                  ชื่อ
                </label>
                <input
                  id="emp-firstname"
                  className={INPUT}
                  placeholder="ชื่อ"
                  aria-invalid={!!errors.firstName}
                  {...register('firstName', { required: 'กรุณากรอกชื่อ' })}
                />
                {errors.firstName && <span className={FIELD_ERROR}>{errors.firstName.message}</span>}
              </div>

              <div className={FIELD_ROW}>
                <label htmlFor="emp-lastname" className={LABEL}>
                  นามสกุล
                </label>
                <input
                  id="emp-lastname"
                  className={INPUT}
                  placeholder="นามสกุล"
                  aria-invalid={!!errors.lastName}
                  {...register('lastName', { required: 'กรุณากรอกนามสกุล' })}
                />
                {errors.lastName && <span className={FIELD_ERROR}>{errors.lastName.message}</span>}
              </div>

              <div className={FIELD_ROW}>
                <label htmlFor="emp-nickname" className={LABEL}>
                  ชื่อเล่น
                </label>
                <input
                  id="emp-nickname"
                  className={INPUT}
                  placeholder="ชื่อเล่น"
                  aria-invalid={!!errors.nickname}
                  {...register('nickname', { required: 'กรุณากรอกชื่อเล่น' })}
                />
                {errors.nickname && <span className={FIELD_ERROR}>{errors.nickname.message}</span>}
              </div>

              <div className={FIELD_ROW}>
                <label htmlFor="emp-phone" className={LABEL}>
                  เบอร์โทร
                </label>
                <input
                  id="emp-phone"
                  className={INPUT}
                  placeholder="เบอร์โทร"
                  {...register('phoneNumber')}
                />
              </div>
            </div>

            <div className={FIELD_ROW}>
              <label htmlFor="emp-department" className={LABEL}>
                แผนก
              </label>
              <Controller
                control={control}
                name="department"
                rules={{ required: 'กรุณาเลือกแผนก' }}
                render={({ field }) => (
                  <Select.Root value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger
                      id="emp-department"
                      ref={field.ref}
                      aria-invalid={!!errors.department}
                      className={SELECT_TRIGGER}
                    >
                      <Select.Value placeholder="เลือกแผนก" />
                      <Select.Icon>
                        <AppIcons.chevronDown />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content position="popper" sideOffset={4} className={SELECT_CONTENT}>
                        <Select.Viewport className={SELECT_VIEWPORT}>
                          {DepartmentOptions.map((opt) => (
                            <Select.Item key={opt.value} value={opt.value} className={SELECT_ITEM}>
                              <Select.ItemText>{opt.label}</Select.ItemText>
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
              {errors.department && <span className={FIELD_ERROR}>{errors.department.message}</span>}
            </div>

            <div className={FIELD_ROW}>
              <label htmlFor="emp-startdate" className={LABEL}>
                วันที่เริ่มงาน
              </label>
              <input
                id="emp-startdate"
                type="date"
                className={INPUT}
                {...register('startDate')}
              />
            </div>

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
                      {field.value ? 'ใช้งาน' : 'ระงับ'}
                    </span>
                  </label>
                )}
              />
            </div>

            <div className={DIALOG_FOOTER}>
              <button type="button" className={btn('ghost')} onClick={onClose} disabled={loading}>
                ยกเลิก
              </button>
              <button type="submit" className={btn('primary')} disabled={loading}>
                {loading && <AppIcons.loading spin />}
                {isEdit ? 'บันทึก' : 'เพิ่มพนักงาน'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
