import { useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuth, DEV_USER } from '@features/auth';
import type { Role, AuthUser } from '@features/auth/types';
import { ENV } from '@config/env';
import {
  AppIcons,
  Button,
  Select,
  Tag,
  Tooltip,
  Drawer,
  Divider,
  Text,
  Switch,
  Stack,
  Inline,
} from '@design-system';

const ALL_ROLES: Role[] = [
  'SuperAdmin', 'Admin', 'Operator', 'Warehouse',
  'Accountant', 'HR', 'Marketing', 'Sales',
];

const ROLE_COLOR: Record<Role, string> = {
  SuperAdmin: 'red', Admin: 'orange', Operator: 'blue', Warehouse: 'cyan',
  Accountant: 'green', HR: 'purple', Marketing: 'magenta', Sales: 'gold',
};

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

      <Tooltip title="Dev Tools" placement="left">
        <Button
          variant="primary"
          size="large"
          icon={<AppIcons.debug />}
          onClick={() => setOpen(true)}
          className="fixed right-6 bottom-6 z-9999 size-12 rounded-full shadow-[0_4px_12px_rgba(114,46,209,0.4)]"
          style={{ background: '#722ed1', borderColor: '#722ed1' }}
        />
      </Tooltip>

      <Drawer
        title={
          <Inline gap={2}>
            <AppIcons.debug style={{ color: '#722ed1' }} />
            <span>Dev Tools</span>
            <Tag color="purple">DEV MODE</Tag>
          </Inline>
        }
        open={open}
        onClose={() => setOpen(false)}
        width={320}
        styles={{ body: { padding: 16 } }}
      >
        <Stack gap={4} className="w-full">
          {/* Auth bypass */}
          <div>
            <Label>Auth</Label>
            <Row>
              <Text>Bypass login</Text>
              <Switch checked={isAuth} onChange={handleBypassToggle} />
            </Row>
          </div>

          <Divider className="my-0" />

          {/* Login as — bypass ครบทุก account + POS */}
          <div>
            <Label>Login as (bypass)</Label>
            <Inline wrap gap={2} className="mt-2">
              {DEV_USER_ACCOUNTS.map((acc) => {
                const active = !!user && accountId(user) === accountId(acc);
                return (
                  <Button
                    key={acc.sub}
                    size="small"
                    variant={active ? 'primary' : 'secondary'}
                    onClick={() => setUser(acc)}
                  >
                    <Tag color={ROLE_COLOR[acc.role]}>{acc.role}</Tag>
                  </Button>
                );
              })}
            </Inline>
            <Button
              icon={<AppIcons.desktop />}
              block
              className="mt-2"
              variant={user && user.type === 'terminal' ? 'primary' : 'secondary'}
              onClick={() => setUser(DEV_POS_ACCOUNT)}
            >
              POS / Terminal ({DEV_POS_ACCOUNT.terminalCode})
            </Button>
          </div>

          <Divider className="my-0" />

          {/* Current user */}
          <div>
            <Label>Current User</Label>
            <div className="mt-2">
              {user ? (
                <Stack gap={1}>
                  <Inline gap={2}>
                    {user.type === 'terminal' ? <AppIcons.desktop /> : <AppIcons.user />}
                    <Text strong>{user.type === 'terminal' ? user.name : user.username}</Text>
                    <Tag color={ROLE_COLOR[user.role]}>{user.role}</Tag>
                    {user.type === 'terminal' && <Tag color="volcano">POS</Tag>}
                  </Inline>
                  <Text type="secondary" size="sm">
                    {user.type === 'terminal' ? `Terminal: ${user.terminalCode}` : `ID: ${user.sub}`}
                  </Text>
                </Stack>
              ) : (
                <Text type="secondary">— ไม่ได้ login —</Text>
              )}
            </div>
          </div>

          <Divider className="my-0" />

          {/* Switch role */}
          <div>
            <Label>Switch Role</Label>
            <Select
              className="mt-2"
              style={{ width: '100%' }}
              value={user?.role}
              disabled={!isAuth}
              onChange={(v) => v && handleRoleChange(v as Role)}
              options={ALL_ROLES.map((r) => ({
                label: <Tag color={ROLE_COLOR[r]}>{r}</Tag>,
                value: r,
              }))}
            />
          </div>

          <Divider className="my-0" />

          {/* Quick actions */}
          <div>
            <Label>Quick Actions</Label>
            <Stack gap={2} className="mt-2 w-full">
              <Button icon={<AppIcons.user />} block onClick={() => setUser(DEV_USER)}>
                Reset to Dev User
              </Button>
              <Button icon={<AppIcons.refresh />} block onClick={() => window.location.reload()}>
                Reload Page
              </Button>
              <Button
                icon={<AppIcons.database />}
                block
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
                Log Auth Store
              </Button>
            </Stack>
          </div>

          <Divider className="my-0" />

          {/* Env info */}
          <div>
            <Label>Environment</Label>
            <div className="mt-2 font-mono text-xs">
              <div>
                <Text type="secondary">VITE_ENV_MODE: </Text>
                <Tag color="purple">{ENV.MODE}</Tag>
              </div>
              <div className="mt-1">
                <Text type="secondary">API: </Text>
                <Text copyable className="text-[11px]">
                  {ENV.API_URL}
                </Text>
              </div>
            </div>
          </div>

          <Divider className="my-0" />

          <Text type="secondary" className="text-[11px]">
            React Query inspector อยู่มุมล่างซ้าย (ไอคอน 🌸)
          </Text>
        </Stack>
      </Drawer>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
      {children}
    </span>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="mt-2 flex items-center justify-between">{children}</div>;
}
