import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth, authService } from '@features/auth';
import { handleError } from '@shared';
import { ROLE_COLOR } from '@config/access';
import { AppIcons } from '@/lib/icons';
import { cn } from '@/lib/utils';
import {
  btn,
  btnIcon,
  CARD_SM,
  CARD_TITLE,
  CELL_CODE,
  dataPill,
  FIELD_ERROR,
  FIELD_ROW,
  INPUT,
  LABEL,
  PAGE_HEADER,
  PAGE_SUBTITLE,
  PAGE_TITLE,
  TEXT,
} from '@/lib/styles';

const MIN_PASSWORD_LENGTH = 6;

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EMPTY: PasswordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

export function ProfilePage() {
  const user = useAuth((s) => s.user);
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState({ current: false, next: false, confirm: false });
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<PasswordForm>({ defaultValues: EMPTY });

  async function handleChangePassword(values: PasswordForm) {
    setSaving(true);
    try {
      await authService.updatePassword(values.currentPassword, values.newPassword);
      reset(EMPTY);
    } catch (err) {
      handleError('เปลี่ยนรหัสผ่าน')(err as Error);
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  const displayName = user.name ?? user.username ?? user.terminalCode ?? '-';

  return (
    <div className="flex flex-col gap-5">
      <div className={PAGE_HEADER}>
        <div className="min-w-0">
          <h1 className={PAGE_TITLE}>โปรไฟล์</h1>
          <p className={PAGE_SUBTITLE}>ข้อมูลบัญชีและการตั้งค่าความปลอดภัย</p>
        </div>
      </div>

      <section className={CARD_SM}>
        <h2 className={cn(CARD_TITLE, 'flex items-center gap-2')}>
          <AppIcons.user />
          ข้อมูลบัญชี
        </h2>
        <dl className="mt-3 flex flex-col gap-3">
          <InfoRow label="ชื่อ" value={displayName} />
          {user.username && (
            <InfoRow label="Username" value={<code className={CELL_CODE}>{user.username}</code>} />
          )}
          {user.terminalCode && (
            <InfoRow
              label="Terminal Code"
              value={<code className={CELL_CODE}>{user.terminalCode}</code>}
            />
          )}
          <InfoRow
            label="บทบาท"
            value={
              <span className={dataPill(ROLE_COLOR[user.role])}>
                {user.isTerminal ? `Terminal · ${user.role}` : user.role}
              </span>
            }
          />
        </dl>
      </section>

      {!user.isTerminal && (
        <section className={CARD_SM}>
          <h2 className={cn(CARD_TITLE, 'flex items-center gap-2')}>
            <AppIcons.key />
            เปลี่ยนรหัสผ่าน
          </h2>

          <form
            noValidate
            className="mt-3 flex max-w-105 flex-col gap-4"
            onSubmit={handleSubmit(handleChangePassword)}
          >
            <div className={FIELD_ROW}>
              <label htmlFor="current-password" className={LABEL}>
                รหัสผ่านปัจจุบัน
              </label>
              <div className="relative">
                <input
                  id="current-password"
                  type={visible.current ? 'text' : 'password'}
                  placeholder="รหัสผ่านปัจจุบัน"
                  autoComplete="current-password"
                  className={cn(INPUT, 'pr-10')}
                  aria-invalid={!!errors.currentPassword}
                  {...register('currentPassword', { required: 'กรุณากรอกรหัสผ่านปัจจุบัน' })}
                />
                <button
                  type="button"
                  aria-label={visible.current ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  onClick={() => setVisible((v) => ({ ...v, current: !v.current }))}
                  className={cn(btnIcon('ghost', 'sm'), 'absolute top-1/2 right-0.5 -translate-y-1/2')}
                >
                  <AppIcons.view />
                </button>
              </div>
              {errors.currentPassword && (
                <span className={FIELD_ERROR}>{errors.currentPassword.message}</span>
              )}
            </div>

            <div className={FIELD_ROW}>
              <label htmlFor="new-password" className={LABEL}>
                รหัสผ่านใหม่
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={visible.next ? 'text' : 'password'}
                  placeholder="รหัสผ่านใหม่"
                  autoComplete="new-password"
                  className={cn(INPUT, 'pr-10')}
                  aria-invalid={!!errors.newPassword}
                  {...register('newPassword', {
                    required: 'กรุณากรอกรหัสผ่านใหม่',
                    minLength: {
                      value: MIN_PASSWORD_LENGTH,
                      message: `รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`,
                    },
                  })}
                />
                <button
                  type="button"
                  aria-label={visible.next ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  onClick={() => setVisible((v) => ({ ...v, next: !v.next }))}
                  className={cn(btnIcon('ghost', 'sm'), 'absolute top-1/2 right-0.5 -translate-y-1/2')}
                >
                  <AppIcons.view />
                </button>
              </div>
              {errors.newPassword && <span className={FIELD_ERROR}>{errors.newPassword.message}</span>}
            </div>

            <div className={FIELD_ROW}>
              <label htmlFor="confirm-password" className={LABEL}>
                ยืนยันรหัสผ่านใหม่
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={visible.confirm ? 'text' : 'password'}
                  placeholder="ยืนยันรหัสผ่านใหม่"
                  autoComplete="new-password"
                  className={cn(INPUT, 'pr-10')}
                  aria-invalid={!!errors.confirmPassword}
                  {...register('confirmPassword', {
                    required: 'กรุณายืนยันรหัสผ่านใหม่',
                    // ตรวจตอน validate ไม่ใช่ตอน submit — ผู้ใช้เห็นทันทีที่ออกจากช่อง
                    validate: (v) => v === getValues('newPassword') || 'รหัสผ่านไม่ตรงกัน',
                  })}
                />
                <button
                  type="button"
                  aria-label={visible.confirm ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  onClick={() => setVisible((v) => ({ ...v, confirm: !v.confirm }))}
                  className={cn(btnIcon('ghost', 'sm'), 'absolute top-1/2 right-0.5 -translate-y-1/2')}
                >
                  <AppIcons.view />
                </button>
              </div>
              {errors.confirmPassword && (
                <span className={FIELD_ERROR}>{errors.confirmPassword.message}</span>
              )}
            </div>

            <button type="submit" className={cn(btn('primary'), 'self-start')} disabled={saving}>
              {saving ? <AppIcons.loading spin /> : <AppIcons.key />}
              เปลี่ยนรหัสผ่าน
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <dt className={cn(TEXT.muted, 'w-30 shrink-0')}>{label}</dt>
      <dd className="m-0 text-sm text-foreground">{value}</dd>
    </div>
  );
}
