import { useState } from 'react';
import { Button, Select, Space, Tag, Tooltip, Drawer, Divider, Typography, Switch } from 'antd';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuth, DEV_USER } from '@features/auth';
import type { Role, AuthUser } from '@features/auth/types';
import { ENV } from '@config/env';
import { AppIcons } from '@design-system';

const { Text } = Typography;

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
          type="primary"
          shape="circle"
          size="large"
          icon={<AppIcons.debug />}
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: '#722ed1',
            borderColor: '#722ed1',
            boxShadow: '0 4px 12px rgba(114,46,209,0.4)',
          }}
        />
      </Tooltip>

      <Drawer
        title={
          <Space>
            <AppIcons.debug style={{ color: '#722ed1' }} />
            <span>Dev Tools</span>
            <Tag color="purple">DEV MODE</Tag>
          </Space>
        }
        open={open}
        onClose={() => setOpen(false)}
        width={320}
        styles={{ body: { padding: '16px' } }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">

          {/* Auth bypass */}
          <div>
            <Label>Auth</Label>
            <Row>
              <Text>Bypass login</Text>
              <Switch checked={isAuth} onChange={handleBypassToggle} />
            </Row>
          </div>

          <Divider style={{ margin: 0 }} />

          {/* Login as — bypass ครบทุก account + POS */}
          <div>
            <Label>Login as (bypass)</Label>
            <Space wrap size={[6, 6]} style={{ marginTop: 8 }}>
              {DEV_USER_ACCOUNTS.map((acc) => {
                const active = !!user && accountId(user) === accountId(acc);
                return (
                  <Button
                    key={acc.sub}
                    size="small"
                    type={active ? 'primary' : 'default'}
                    onClick={() => setUser(acc)}
                  >
                    <Tag color={ROLE_COLOR[acc.role]} style={{ margin: 0 }}>{acc.role}</Tag>
                  </Button>
                );
              })}
            </Space>
            <Button
              icon={<AppIcons.desktop />}
              block
              style={{ marginTop: 8 }}
              type={user && user.type === 'terminal' ? 'primary' : 'default'}
              onClick={() => setUser(DEV_POS_ACCOUNT)}
            >
              POS / Terminal ({DEV_POS_ACCOUNT.terminalCode})
            </Button>
          </div>

          <Divider style={{ margin: 0 }} />

          {/* Current user */}
          <div>
            <Label>Current User</Label>
            <div style={{ marginTop: 8 }}>
              {user ? (
                <Space direction="vertical" size={4}>
                  <Space>
                    {user.type === 'terminal' ? <AppIcons.desktop /> : <AppIcons.user />}
                    <Text strong>{user.type === 'terminal' ? user.name : user.username}</Text>
                    <Tag color={ROLE_COLOR[user.role]}>{user.role}</Tag>
                    {user.type === 'terminal' && <Tag color="volcano">POS</Tag>}
                  </Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {user.type === 'terminal' ? `Terminal: ${user.terminalCode}` : `ID: ${user.sub}`}
                  </Text>
                </Space>
              ) : (
                <Text type="secondary">— ไม่ได้ login —</Text>
              )}
            </div>
          </div>

          <Divider style={{ margin: 0 }} />

          {/* Switch role */}
          <div>
            <Label>Switch Role</Label>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={user?.role}
              disabled={!isAuth}
              onChange={handleRoleChange}
              options={ALL_ROLES.map((r) => ({
                label: <Tag color={ROLE_COLOR[r]} style={{ margin: 0 }}>{r}</Tag>,
                value: r,
              }))}
            />
          </div>

          <Divider style={{ margin: 0 }} />

          {/* Quick actions */}
          <div>
            <Label>Quick Actions</Label>
            <Space style={{ marginTop: 8, width: '100%' }} direction="vertical">
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
            </Space>
          </div>

          <Divider style={{ margin: 0 }} />

          {/* Env info */}
          <div>
            <Label>Environment</Label>
            <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 12 }}>
              <div>
                <Text type="secondary">VITE_ENV_MODE: </Text>
                <Tag color="purple">{ENV.MODE}</Tag>
              </div>
              <div style={{ marginTop: 4 }}>
                <Text type="secondary">API: </Text>
                <Text copyable style={{ fontSize: 11 }}>{ENV.API_URL}</Text>
              </div>
            </div>
          </div>

          <Divider style={{ margin: 0 }} />

          <Text type="secondary" style={{ fontSize: 11 }}>
            React Query inspector อยู่มุมล่างซ้าย (ไอคอน 🌸)
          </Text>

        </Space>
      </Drawer>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
      {children}
    </Text>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
      {children}
    </div>
  );
}
