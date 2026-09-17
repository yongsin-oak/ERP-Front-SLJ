import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Popover, ToggleGroup } from 'radix-ui';
import { useForm } from 'react-hook-form';
import { showError } from '@shared';
import { resolveRedirect } from '@config/access';
import { AppIcons } from '@/lib/icons';
import { useCombobox } from '@/lib/useCombobox';
import { cn } from '@/lib/utils';
import {
  btn,
  btnIcon,
  FIELD_ERROR,
  FIELD_ROW,
  INPUT,
  INPUT_SM,
  LABEL,
  POPOVER_CONTENT,
  SEGMENTED_ITEM,
  SEGMENTED_ROOT,
  SELECT_ITEM,
  SELECT_TRIGGER,
} from '@/lib/styles';
import { useAuth } from '../stores';
import { useLoginTerminals } from '../react-query';

type LoginMode = 'staff' | 'terminal';

/* ── safe redirect ─────────────────────────────────── */
const SAFE_PATH = /^\/[A-Za-z0-9/_\-?=&%.]*$/;

/** path ที่ถูกเด้งมาจากหน้าที่ต้อง login ก่อน — null ถ้าไม่มี (ให้ผู้เรียกเลือก landing ตามประเภทผู้ใช้) */
function resolveFrom(value: string | undefined | null): string | null {
  if (!value || !SAFE_PATH.test(value) || value.startsWith('/login')) return null;
  return value;
}

/* ── brand ─────────────────────────────────────────── */
const APP_NAME = 'SLJ Supply Center';
/** ไฟล์ใน public/ — เสิร์ฟที่ root ไม่ต้อง import ผ่าน bundler */
const LOGO_SRC = '/slj-supply-logo.webp';

/* ── main ───────────────────────────────────────────── */
export function LoginPage() {
  // selector ทีละค่า — subscribe เท่าที่ใช้ (ดูเหตุผลใน PrivateRoute)
  const login = useAuth((s) => s.login);
  const loginTerminal = useAuth((s) => s.loginTerminal);
  const isAuth = useAuth((s) => s.isAuth);
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const stateFrom = (location.state as { from?: string } | null)?.from;
  const from = resolveFrom(stateFrom ?? params.get('from'));

  const [mode, setMode] = useState<LoginMode>('terminal');
  const [submitting, setSubmitting] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [showTerminalPassword, setShowTerminalPassword] = useState(false);
  const [terminalCode, setTerminalCode] = useState<string | undefined>();
  const [terminalCodeError, setTerminalCodeError] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const staffForm = useForm<{ username: string; password: string }>({
    defaultValues: { username: '', password: '' },
  });
  const terminalForm = useForm<{ password: string }>({ defaultValues: { password: '' } });

  const {
    data: terminals,
    isLoading: loadingTerminals,
    isError: terminalsError,
    refetch: refetchTerminals,
  } = useLoginTerminals();

  /** ค้นได้ทั้งรหัสเครื่องและชื่อ — พนักงานจำได้อย่างใดอย่างหนึ่ง ไม่ควรบังคับให้จำรหัส */
  const terminalOptions = useMemo(
    () =>
      (terminals ?? []).map((t) => ({
        value: t.terminalCode,
        label: t.terminalCode,
        searchText: t.name,
      })),
    [terminals],
  );

  const terminalNameOf = useMemo(() => {
    const m = new Map((terminals ?? []).map((t) => [t.terminalCode, t.name]));
    return (code?: string) => (code ? (m.get(code) ?? '') : '');
  }, [terminals]);

  const combo = useCombobox({
    options: terminalOptions,
    value: terminalCode,
    onChange: (v) => {
      setTerminalCode(v);
      setTerminalCodeError('');
    },
  });

  useEffect(() => {
    if (isAuth) navigate(resolveRedirect(user, from), { replace: true });
  }, [isAuth, navigate, from, user]);

  /* ── staff login ── */
  async function handleStaffSubmit(values: { username: string; password: string }) {
    setSubmitting(true);
    try {
      await login(values.username, values.password);
      // อ่าน user จาก store โดยตรง — state ใน closure นี้ยังเป็นค่าก่อน login
      navigate(resolveRedirect(useAuth.getState().user, from), { replace: true });
    } catch (err) {
      showError(err, 'เข้าสู่ระบบ');
    } finally {
      setSubmitting(false);
    }
  }

  /* ── terminal login ── */
  async function handleTerminalSubmit(values: { password: string }) {
    if (!terminalCode) {
      setTerminalCodeError('กรุณาเลือกเครื่อง');
      return;
    }
    setSubmitting(true);
    try {
      await loginTerminal(terminalCode.trim(), values.password);
      navigate(resolveRedirect(useAuth.getState().user, from), { replace: true });
    } catch (err) {
      showError(err, 'เข้าสู่ระบบด้วย Terminal');
    } finally {
      setSubmitting(false);
    }
  }

  function handleModeChange(v: LoginMode) {
    setMode(v);
    staffForm.reset();
    terminalForm.reset();
    setTerminalCode(undefined);
    setTerminalCodeError('');
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-sm">
        {/* ── โลโก้ ─────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3">
          {/* ไฟล์เป็น webp ทึบ (พื้นขาวติดมาในภาพ) → ครอบเป็นไทล์มีขอบ ให้ดูตั้งใจทั้ง light/dark */}
          <img
            src={LOGO_SRC}
            alt={APP_NAME}
            width={56}
            height={56}
            className="size-14 rounded-lg border border-border object-cover"
          />
          <span className="text-sm text-foreground-lighter">{APP_NAME}</span>
        </div>

        {/* ── ฟอร์ม ─────────────────────────────────── */}
        <div className="mt-6 rounded-lg border border-border bg-background p-6 sm:p-8">
          <h1 className="text-center font-heading text-lg font-semibold text-foreground">
            เข้าสู่ระบบ
          </h1>

          <ToggleGroup.Root
            type="single"
            value={mode}
            // ToggleGroup ยอมให้ "ไม่เลือกอะไรเลย" ได้ — กันค่าว่างไว้ ไม่งั้นกดปุ่มที่เลือกอยู่ซ้ำ
            // แล้วฟอร์มจะหายไปทั้งก้อน
            onValueChange={(v) => v && handleModeChange(v as LoginMode)}
            className={cn(SEGMENTED_ROOT, 'mt-6 grid w-full grid-cols-2')}
          >
            <ToggleGroup.Item value="terminal" className={cn(SEGMENTED_ITEM, 'h-9 justify-center')}>
              <AppIcons.terminal className="size-3.5" />
              เครื่องยิงออเดอร์
            </ToggleGroup.Item>
            <ToggleGroup.Item value="staff" className={cn(SEGMENTED_ITEM, 'h-9 justify-center')}>
              <AppIcons.user className="size-3.5" />
              เจ้าหน้าที่
            </ToggleGroup.Item>
          </ToggleGroup.Root>

          <div className="mt-6">
            {mode === 'terminal' ?
              <form
                noValidate
                className="flex flex-col gap-4"
                onSubmit={terminalForm.handleSubmit(handleTerminalSubmit)}
              >
                <div className={FIELD_ROW}>
                  <label htmlFor="login-terminal" className={LABEL}>
                    เครื่อง
                  </label>
                  <Popover.Root open={combo.open} onOpenChange={combo.setOpen}>
                    <Popover.Trigger asChild>
                      <button
                        type="button"
                        id="login-terminal"
                        aria-invalid={!!terminalCodeError}
                        className={cn(SELECT_TRIGGER, 'h-9.5')}
                      >
                        {terminalCode ?
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="font-mono">{terminalCode}</span>
                            <span className="truncate text-foreground-lighter">
                              {terminalNameOf(terminalCode)}
                            </span>
                          </span>
                        : <span className="text-foreground-muted">เลือกเครื่องที่ใช้งาน</span>}
                        <AppIcons.chevronDown />
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content
                        align="start"
                        sideOffset={4}
                        className={cn(POPOVER_CONTENT, 'w-(--radix-popover-trigger-width) p-0')}
                        onOpenAutoFocus={(e) => {
                          e.preventDefault();
                          searchInputRef.current?.focus();
                        }}
                      >
                        <div className="border-b border-border-muted p-1.5">
                          <input
                            ref={searchInputRef}
                            value={combo.search}
                            onChange={(e) => combo.onSearchChange(e.target.value)}
                            onKeyDown={combo.onKeyDown}
                            placeholder="ค้นหารหัสหรือชื่อเครื่อง..."
                            aria-label="ค้นหาเครื่อง"
                            className={INPUT_SM}
                          />
                        </div>
                        <div
                          ref={combo.setListEl}
                          role="listbox"
                          className="max-h-60 overflow-y-auto p-1"
                        >
                          {combo.filtered.length === 0 ?
                            <div className="px-2 py-6 text-center text-sm text-foreground-muted">
                              {loadingTerminals ? 'กำลังโหลด…' : 'ไม่พบเครื่องที่ใช้งานอยู่'}
                            </div>
                          : combo.filtered.map((opt, i) => (
                              <button
                                key={opt.value}
                                type="button"
                                role="option"
                                aria-selected={opt.value === terminalCode}
                                data-index={i}
                                onMouseEnter={() => combo.setActiveIndex(i)}
                                onClick={() => combo.pick(opt.value)}
                                className={cn(
                                  SELECT_ITEM,
                                  'text-left',
                                  i === combo.activeIndex && 'bg-surface-200 text-foreground',
                                )}
                              >
                                <span className="font-mono">{opt.label}</span>
                                <span className="flex-1 truncate text-foreground-lighter">
                                  {opt.searchText}
                                </span>
                                {opt.value === terminalCode && (
                                  <AppIcons.check className="text-primary" />
                                )}
                              </button>
                            ))
                          }
                        </div>
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>

                  {terminalCodeError && <span className={FIELD_ERROR}>{terminalCodeError}</span>}
                  {terminalsError && (
                    <span className="flex items-center gap-1.5 text-xs text-error-text">
                      โหลดรายชื่อเครื่องไม่สำเร็จ
                      <button
                        type="button"
                        className="underline underline-offset-2 hover:text-foreground"
                        onClick={() => void refetchTerminals()}
                      >
                        ลองใหม่
                      </button>
                    </span>
                  )}
                </div>

                <div className={FIELD_ROW}>
                  <label htmlFor="login-terminal-password" className={LABEL}>
                    รหัสผ่านเครื่อง
                  </label>
                  <div className="relative">
                    <input
                      id="login-terminal-password"
                      type={showTerminalPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className={cn(INPUT, 'h-9.5 pr-10')}
                      aria-invalid={!!terminalForm.formState.errors.password}
                      {...terminalForm.register('password', {
                        required: 'กรุณากรอกรหัสผ่าน Terminal',
                      })}
                    />
                    <button
                      type="button"
                      aria-label={showTerminalPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                      onClick={() => setShowTerminalPassword((s) => !s)}
                      className={cn(
                        btnIcon('ghost', 'sm'),
                        'absolute top-1/2 right-0.5 -translate-y-1/2',
                      )}
                    >
                      <AppIcons.view />
                    </button>
                  </div>
                  {terminalForm.formState.errors.password && (
                    <span className={FIELD_ERROR}>
                      {terminalForm.formState.errors.password.message}
                    </span>
                  )}
                </div>

                {/* h-11 = 44px ตาม UX bar สำหรับหน้าจอที่ Operator/Warehouse ใช้ทุกกะ */}
                <button
                  type="submit"
                  disabled={submitting}
                  className={cn(btn('primary', 'lg'), 'mt-2 h-11 w-full')}
                >
                  {submitting && <AppIcons.loading spin />}
                  เข้าสู่ระบบ
                </button>
              </form>
            : <form
                noValidate
                className="flex flex-col gap-4"
                onSubmit={staffForm.handleSubmit(handleStaffSubmit)}
              >
                <div className={FIELD_ROW}>
                  <label htmlFor="login-username" className={LABEL}>
                    ชื่อผู้ใช้
                  </label>
                  <input
                    id="login-username"
                    autoComplete="username"
                    autoFocus
                    className={cn(INPUT, 'h-9.5')}
                    aria-invalid={!!staffForm.formState.errors.username}
                    {...staffForm.register('username', { required: 'กรุณากรอกชื่อผู้ใช้' })}
                  />
                  {staffForm.formState.errors.username && (
                    <span className={FIELD_ERROR}>
                      {staffForm.formState.errors.username.message}
                    </span>
                  )}
                </div>

                <div className={FIELD_ROW}>
                  <label htmlFor="login-password" className={LABEL}>
                    รหัสผ่าน
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showStaffPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className={cn(INPUT, 'h-9.5 pr-10')}
                      aria-invalid={!!staffForm.formState.errors.password}
                      {...staffForm.register('password', { required: 'กรุณากรอกรหัสผ่าน' })}
                    />
                    <button
                      type="button"
                      aria-label={showStaffPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                      onClick={() => setShowStaffPassword((s) => !s)}
                      className={cn(
                        btnIcon('ghost', 'sm'),
                        'absolute top-1/2 right-0.5 -translate-y-1/2',
                      )}
                    >
                      <AppIcons.view />
                    </button>
                  </div>
                  {staffForm.formState.errors.password && (
                    <span className={FIELD_ERROR}>
                      {staffForm.formState.errors.password.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={cn(btn('primary', 'lg'), 'mt-2 h-11 w-full')}
                >
                  {submitting && <AppIcons.loading spin />}
                  เข้าสู่ระบบ
                </button>
              </form>
            }
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-foreground-muted">
          ลืมรหัสผ่านหรือเข้าไม่ได้ — ติดต่อผู้ดูแลระบบ
        </p>
      </div>
    </div>
  );
}
