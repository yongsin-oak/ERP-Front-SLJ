import { useState } from 'react';
import { Dialog, Select, Switch, Tooltip } from 'radix-ui';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuth, DEV_USER } from '@features/auth';
import type { Role, AuthUser } from '@features/auth/types';
import { ENV } from '@config/env';
import { ROLE_COLOR } from '@config/access';
import { AppIcons } from '@/lib/icons';
import { cn } from '@/lib/utils';
import {
  btn,
  dataPill,
  DIALOG_CLOSE_X,
  DIALOG_OVERLAY,
  DIALOG_TITLE,
  DRAWER_CONTENT,
  SELECT_CONTENT,
  SELECT_ITEM,
  SELECT_TRIGGER,
  SELECT_VIEWPORT,
  SEPARATOR_H,
  SWITCH,
  SWITCH_THUMB,
  TEXT,
  TOOLTIP_CONTENT,
} from '@/lib/styles';

const ALL_ROLES: Role[] = [
  'SuperAdmin', 'Admin', 'Operator', 'Warehouse',
  'Accountant', 'HR', 'Marketing', 'Sales',
];

/** Preset bypass account ต่อ role — คลิกเดียว login ทันที (ไม่ต้องผ่าน backend) */
const DEV_USER_ACCOUNTS: AuthUser[] = ALL_ROLES.map((role) => ({
  sub: `dev-${role.toLowerCase()}`,
  username: `dev_${role.toLowerCase()}`,
  role,
  type: 'user',
}));

/** POS/Terminal bypass account — type 'terminal' เหมือน login ด้วย terminal code */
const DEV_POS_ACCOUNT: AuthUser = {
  terminalCode: 'POS-DEV-01',
  name: 'POS Terminal (Dev)',
  role: 'Operator',
  type: 'terminal',
  isTerminal: true,
};

/** ระบุชื่อที่ใช้แสดง/เทียบความเป็น account เดียวกัน (user → sub, terminal → terminalCode) */
function accountId(u: AuthUser): string {
  return u.type === 'terminal' ? (u.terminalCode ?? '') : (u.sub ?? '');
}

export function DevTools() {
  const [open, setOpen] = useState(false);
  const { user, isAuth, setUser } = useAuth();

  function handleRoleChange(role: Role) {
    if (!user) return;
    setUser({ ...user, role });
  }

  function handleBypassToggle(checked: boolean) {
    setUser(checked ? DEV_USER : null);
  }

  return (
    <>
      {/* React Query DevTools — floating panel จาก library โดยตรง */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />

      <Tooltip.Provider delayDuration={300}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              aria-label="เปิด Dev Tools"
              onClick={() => setOpen(true)}
              className={cn(
                btn('primary', 'lg'),
                'fixed right-6 bottom-6 z-9999 size-12 rounded-full border-purple-700 bg-purple-700 shadow-overlay',
              )}
            >
              <AppIcons.debug />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content side="left" sideOffset={6} className={TOOLTIP_CONTENT}>
              Dev Tools
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={DIALOG_OVERLAY} />
          <Dialog.Content
            className={cn(DRAWER_CONTENT, 'max-w-80 overflow-y-auto')}
            aria-describedby={undefined}
          >
            <Dialog.Title className={cn(DIALOG_TITLE, 'flex items-center gap-2')}>
              <AppIcons.debug className="text-purple-700" />
              <span>Dev Tools</span>
              <span className={dataPill('purple')}>DEV MODE</span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" aria-label="ปิด" className={DIALOG_CLOSE_X}>
                <AppIcons.close />
              </button>
            </Dialog.Close>

            <div className="flex w-full flex-col gap-4">
              {/* Auth bypass */}
              <div>
                <Label>Auth</Label>
                <div className="mt-2 flex items-center justify-between">
                  <span className={TEXT.base}>Bypass login</span>
                  <Switch.Root
                    checked={isAuth}
                    onCheckedChange={handleBypassToggle}
                    aria-label="Bypass login"
                    className={SWITCH}
                  >
                    <Switch.Thumb className={SWITCH_THUMB} />
                  </Switch.Root>
                </div>
              </div>

              <div className={SEPARATOR_H} />

              {/* Login as — bypass ครบทุก account + POS */}
              <div>
                <Label>Login as (bypass)</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DEV_USER_ACCOUNTS.map((acc) => {
                    const active = !!user && accountId(user) === accountId(acc);
                    return (
                      <button
                        key={acc.sub}
                        type="button"
                        className={btn(active ? 'primary' : 'secondary', 'sm')}
                        onClick={() => setUser(acc)}
                      >
                        <span className={dataPill(ROLE_COLOR[acc.role])}>{acc.role}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className={cn(
                    btn(user && user.type === 'terminal' ? 'primary' : 'secondary'),
                    'mt-2 w-full',
                  )}
                  onClick={() => setUser(DEV_POS_ACCOUNT)}
                >
                  <AppIcons.desktop />
                  POS / Terminal ({DEV_POS_ACCOUNT.terminalCode})
                </button>
              </div>

              <div className={SEPARATOR_H} />

              {/* Current user */}
              <div>
                <Label>Current User</Label>
                <div className="mt-2">
                  {user ?
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {user.type === 'terminal' ? <AppIcons.desktop /> : <AppIcons.user />}
                        <span className={TEXT.strong}>
                          {user.type === 'terminal' ? user.name : user.username}
                        </span>
                        <span className={dataPill(ROLE_COLOR[user.role])}>{user.role}</span>
                        {user.type === 'terminal' && (
                          <span className={dataPill('volcano')}>POS</span>
                        )}
                      </div>
                      <span className={TEXT.subtle}>
                        {user.type === 'terminal' ?
                          `Terminal: ${user.terminalCode}`
                        : `ID: ${user.sub}`}
                      </span>
                    </div>
                  : <span className={TEXT.muted}>— ไม่ได้ login —</span>}
                </div>
              </div>

              <div className={SEPARATOR_H} />

              {/* Switch role */}
              <div>
                <Label>Switch Role</Label>
                <Select.Root
                  value={user?.role}
                  disabled={!isAuth}
                  onValueChange={(v) => v && handleRoleChange(v as Role)}
                >
                  <Select.Trigger className={cn(SELECT_TRIGGER, 'mt-2')} aria-label="เปลี่ยน role">
                    <Select.Value placeholder="เลือก role" />
                    <Select.Icon>
                      <AppIcons.chevronDown />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content position="popper" sideOffset={4} className={SELECT_CONTENT}>
                      <Select.Viewport className={SELECT_VIEWPORT}>
                        {ALL_ROLES.map((r) => (
                          <Select.Item key={r} value={r} className={SELECT_ITEM}>
                            <Select.ItemText>
                              <span className={dataPill(ROLE_COLOR[r])}>{r}</span>
                            </Select.ItemText>
                            <Select.ItemIndicator className="absolute right-2 text-primary">
                              <AppIcons.check />
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>

              <div className={SEPARATOR_H} />

              {/* Quick actions */}
              <div>
                <Label>Quick Actions</Label>
                <div className="mt-2 flex w-full flex-col gap-2">
                  <button type="button" className={btn()} onClick={() => setUser(DEV_USER)}>
                    <AppIcons.user />
                    Reset to Dev User
                  </button>
                  <button
                    type="button"
                    className={btn()}
                    onClick={() => window.location.reload()}
                  >
                    <AppIcons.refresh />
                    Reload Page
                  </button>
                  <button
                    type="button"
                    className={btn()}
                    onClick={() => {
                      // Zustand store snapshot — print ไปยัง console devtools
                      // eslint-disable-next-line no-console
                      console.group('[DevTools] Zustand — useAuth store');
                      // eslint-disable-next-line no-console
                      console.log(useAuth.getState());
                      // eslint-disable-next-line no-console
                      console.groupEnd();
                    }}
                  >
                    <AppIcons.database />
                    Log Auth Store
                  </button>
                </div>
              </div>

              <div className={SEPARATOR_H} />

              {/* Env info */}
              <div>
                <Label>Environment</Label>
                <div className="mt-2 font-mono text-xs">
                  <div className="flex items-center gap-1">
                    <span className={TEXT.muted}>VITE_ENV_MODE: </span>
                    <span className={dataPill('purple')}>{ENV.MODE}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className={TEXT.muted}>API: </span>
                    <span className="text-[11px] break-all">{ENV.API_URL}</span>
                  </div>
                </div>
              </div>

              <div className={SEPARATOR_H} />

              <span className={cn(TEXT.muted, 'text-[11px]')}>
                React Query inspector อยู่มุมล่างซ้าย (ไอคอน 🌸)
              </span>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium tracking-widest text-foreground-muted uppercase">
      {children}
    </span>
  );
}
