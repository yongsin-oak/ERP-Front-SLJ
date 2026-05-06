import { useState } from 'react';
import { Button, Select, Space, Tag, Tooltip, Drawer, Divider, Typography, Switch } from 'antd';
import { BugOutlined, UserOutlined, ReloadOutlined, DatabaseOutlined } from '@ant-design/icons';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuth, DEV_USER } from '@features/auth/hooks';
import type { Role } from '@features/auth/types';

const { Text } = Typography;

const ALL_ROLES: Role[] = [
  'SuperAdmin', 'Admin', 'Operator', 'Warehouse',
  'Accountant', 'HR', 'Marketing', 'Sales',
];

const ROLE_COLOR: Record<Role, string> = {
  SuperAdmin: 'red', Admin: 'orange', Operator: 'blue', Warehouse: 'cyan',
  Accountant: 'green', HR: 'purple', Marketing: 'magenta', Sales: 'gold',
};

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
          icon={<BugOutlined />}
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
            <BugOutlined style={{ color: '#722ed1' }} />
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

          {/* Current user */}
          <div>
            <Label>Current User</Label>
            <div style={{ marginTop: 8 }}>
              {user ? (
                <Space direction="vertical" size={4}>
                  <Space>
                    <UserOutlined />
                    <Text strong>{user.username}</Text>
                    <Tag color={ROLE_COLOR[user.role]}>{user.role}</Tag>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>ID: {user.sub}</Text>
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
              <Button icon={<UserOutlined />} block onClick={() => setUser(DEV_USER)}>
                Reset to Dev User
              </Button>
              <Button icon={<ReloadOutlined />} block onClick={() => window.location.reload()}>
                Reload Page
              </Button>
              <Button
                icon={<DatabaseOutlined />}
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
                <Tag color="purple">development</Tag>
              </div>
              <div style={{ marginTop: 4 }}>
                <Text type="secondary">API: </Text>
                <Text copyable style={{ fontSize: 11 }}>{import.meta.env.VITE_BACKEND_API_URL}</Text>
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
