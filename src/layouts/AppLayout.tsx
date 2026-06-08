import { useState, useMemo } from 'react';
import { Layout, Menu, Button, Drawer, Flex, Typography, Popconfirm, Avatar, Tag } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';
import {
  InboxOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  HistoryOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  MenuOutlined,
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
  TagsOutlined,
  AppstoreOutlined,
  SafetyCertificateOutlined,
  DesktopOutlined,
  SettingOutlined,
  BarcodeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { Role } from '@features/auth/types';
import { useAuth } from '@features/auth';
import { ActorModal } from '@features/auth';
import { colors } from '@design-system';

type MenuItem = Required<MenuProps>['items'][number];
const { Sider, Content, Header } = Layout;

const SIDEBAR_WIDTH = 230;
const SIDEBAR_COLLAPSED_WIDTH = 64;
const SIDEBAR_BG = '#ffffff';
const SIDEBAR_BORDER = colors.border.default;

const ROLE_COLOR: Record<Role, string> = {
  SuperAdmin: 'red', Admin: 'orange', Operator: 'blue', Warehouse: 'cyan',
  Accountant: 'green', HR: 'purple', Marketing: 'magenta', Sales: 'gold',
};

/* ── Nav tree ──────────────────────────────────────── */
interface NavLeaf {
  key: string;
  icon: React.ReactNode;
  label: string;
  roles?: Role[];
}

interface NavGroup {
  groupKey: string;
  icon: React.ReactNode;
  label: string;
  children: NavLeaf[];
}

type NavSection = NavLeaf | NavGroup;

const NAV: NavSection[] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'แดชบอร์ด' },
  {
    groupKey: 'order',
    icon: <ShoppingCartOutlined />,
    label: 'Order',
    children: [
      { key: '/order',         icon: <PlusOutlined />,    label: 'บันทึก Order' },
      { key: '/order/history', icon: <HistoryOutlined />, label: 'ประวัติ Order' },
    ],
  },
  {
    groupKey: 'inventory',
    icon: <InboxOutlined />,
    label: 'สินค้า',
    children: [
      { key: '/inventory', icon: <BarcodeOutlined />,   label: 'คลังสินค้า' },
      { key: '/brand',     icon: <TagsOutlined />,      label: 'แบรนด์',    roles: ['SuperAdmin'] },
      { key: '/category',  icon: <AppstoreOutlined />,  label: 'หมวดหมู่',  roles: ['SuperAdmin'] },
    ],
  },
  {
    groupKey: 'management',
    icon: <TeamOutlined />,
    label: 'จัดการ',
    children: [
      { key: '/shop',     icon: <ShopOutlined />, label: 'ร้านค้า',  roles: ['SuperAdmin'] },
      { key: '/employee', icon: <TeamOutlined />, label: 'พนักงาน', roles: ['SuperAdmin'] },
    ],
  },
  {
    groupKey: 'system',
    icon: <SettingOutlined />,
    label: 'ระบบ',
    children: [
      { key: '/user',     icon: <UserOutlined />,              label: 'ผู้ใช้งาน', roles: ['SuperAdmin'] },
      { key: '/terminal', icon: <DesktopOutlined />,           label: 'Terminal',   roles: ['SuperAdmin'] },
      { key: '/role',     icon: <SafetyCertificateOutlined />, label: 'บทบาท',     roles: ['SuperAdmin'] },
    ],
  },
];

function buildMenuItems(userRole: Role | undefined): MenuItem[] {
  return NAV.flatMap((section): MenuItem[] => {
    if ('groupKey' in section) {
      const visible = section.children.filter(
        (c) => !c.roles || (userRole && c.roles.includes(userRole)),
      );
      if (!visible.length) return [];
      return [{
        key: section.groupKey,
        icon: section.icon,
        label: section.label,
        children: visible.map((c) => ({ key: c.key, icon: c.icon, label: c.label })),
      }];
    }
    if (section.roles && (!userRole || !section.roles.includes(userRole))) return [];
    return [{ key: section.key, icon: section.icon, label: section.label }];
  });
}

function getActiveLeafKey(pathname: string): string {
  const leaves = NAV.flatMap((s) => ('groupKey' in s ? s.children : [s]));
  return (
    [...leaves]
      .sort((a, b) => b.key.length - a.key.length)
      .find((l) => pathname === l.key || pathname.startsWith(`${l.key}/`))?.key ?? ''
  );
}

function getInitialOpenKeys(pathname: string): string[] {
  const groups = NAV.filter((s): s is NavGroup => 'groupKey' in s);
  const active = groups.find((g) =>
    g.children.some((c) => pathname === c.key || pathname.startsWith(`${c.key}/`)),
  );
  return active ? [active.groupKey] : [];
}

/* ── SidebarMenu ───────────────────────────────────── */
function SidebarMenu({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = useAuth((s) => s.user?.role);

  const items = useMemo(() => buildMenuItems(userRole), [userRole]);
  const selectedKey = useMemo(() => getActiveLeafKey(location.pathname), [location.pathname]);
  const defaultOpenKeys = useMemo(() => getInitialOpenKeys(location.pathname), []);

  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      defaultOpenKeys={defaultOpenKeys}
      inlineCollapsed={collapsed}
      style={{ border: 'none', background: 'transparent', flex: 1 }}
      items={items}
      onClick={({ key }) => {
        if (key.startsWith('/')) {
          navigate(key);
          onNavigate?.();
        }
      }}
    />
  );
}

/* ── Brand ─────────────────────────────────────────── */
function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Flex align="center" gap={10} style={{ overflow: 'hidden' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: colors.brand.primary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 2px 8px ${colors.brand.primary}55`,
      }}>
        <Typography.Text strong style={{ color: '#fff', fontSize: 15 }}>S</Typography.Text>
      </div>
      {!collapsed && (
        <div style={{ overflow: 'hidden' }}>
          <Typography.Text strong style={{ fontSize: 14, letterSpacing: 0.4, whiteSpace: 'nowrap', display: 'block', lineHeight: 1.3 }}>
            SLJ ERP
          </Typography.Text>
          <Typography.Text style={{ fontSize: 10, color: colors.text.tertiary, letterSpacing: 0.5, display: 'block' }}>
            Management System
          </Typography.Text>
        </div>
      )}
    </Flex>
  );
}

/* ── UserFooter ─────────────────────────────────────── */
interface FooterUser { username?: string; terminalCode?: string; role: Role; isTerminal?: boolean }

function UserFooter({ collapsed, user, onLogout }: {
  collapsed: boolean;
  user: FooterUser | null;
  onLogout: () => void;
}) {
  return (
    <div style={{ borderTop: `1px solid ${SIDEBAR_BORDER}`, padding: '10px 8px 8px' }}>
      {!collapsed && user && (
        <Flex align="center" gap={10} style={{ padding: '4px 8px 10px' }}>
          <Avatar
            size={32}
            icon={<UserOutlined />}
            style={{ background: colors.brand.primary, flexShrink: 0, fontSize: 13 }}
          />
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <Typography.Text
              strong
              style={{ fontSize: 13, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}
            >
              {user.username ?? user.terminalCode}
            </Typography.Text>
            <Tag
              color={ROLE_COLOR[user.role]}
              style={{ margin: 0, fontSize: 10, lineHeight: '16px', padding: '0 5px', marginTop: 2 }}
            >
              {user.isTerminal ? `Terminal · ${user.role}` : user.role}
            </Tag>
          </div>
        </Flex>
      )}
      <Popconfirm
        title="ออกจากระบบ?"
        onConfirm={onLogout}
        okText="ออกจากระบบ"
        cancelText="ยกเลิก"
        okButtonProps={{ danger: true }}
      >
        <Button
          type="text"
          icon={<LogoutOutlined />}
          danger
          block
          style={{ textAlign: collapsed ? 'center' : 'left', justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          {!collapsed && 'ออกจากระบบ'}
        </Button>
      </Popconfirm>
    </div>
  );
}

/* ── AppLayout ──────────────────────────────────────── */
export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const footerUser: FooterUser | null = user
    ? { username: user.username, terminalCode: user.terminalCode, role: user.role, isTerminal: user.isTerminal }
    : null;

  return (
    <Layout style={{ minHeight: '100vh' }}>

      {/* ── Desktop Sidebar ── */}
      <Sider
        width={SIDEBAR_WIDTH}
        collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
        collapsed={collapsed}
        className="desktop-sidebar"
        style={{
          background: SIDEBAR_BG,
          borderRight: `1px solid ${SIDEBAR_BORDER}`,
          position: 'fixed',
          left: 0, top: 0, bottom: 0,
          zIndex: 100,
          boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
        }}
      >
        <Flex vertical style={{ height: '100%' }}>
          {/* header: brand + collapse toggle */}
          <Flex
            align="center"
            justify={collapsed ? 'center' : 'space-between'}
            style={{
              padding: collapsed ? '14px 0' : '12px 10px 12px 14px',
              borderBottom: `1px solid ${SIDEBAR_BORDER}`,
              minHeight: 56,
            }}
          >
            <Brand collapsed={collapsed} />
            {!collapsed && (
              <Button
                type="text"
                size="small"
                icon={<MenuFoldOutlined />}
                onClick={() => setCollapsed(true)}
                style={{ color: colors.text.tertiary, flexShrink: 0 }}
              />
            )}
            {collapsed && (
              <Button
                type="text"
                size="small"
                icon={<MenuUnfoldOutlined />}
                onClick={() => setCollapsed(false)}
                style={{ color: colors.text.tertiary, position: 'absolute', bottom: 72, left: 0, right: 0, margin: '0 auto', width: 40 }}
              />
            )}
          </Flex>

          {/* nav */}
          <div style={{ flex: 1, overflow: 'auto', paddingTop: 8, paddingBottom: 8 }}>
            <SidebarMenu collapsed={collapsed} />
          </div>

          <UserFooter collapsed={collapsed} user={footerUser} onLogout={handleLogout} />
        </Flex>
      </Sider>

      {/* ── Mobile Header ── */}
      <Header
        className="mobile-header"
        style={{
          background: SIDEBAR_BG,
          borderBottom: `1px solid ${SIDEBAR_BORDER}`,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 100,
          height: 52,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <Brand collapsed={false} />
        {user && (
          <Flex align="center" gap={8}>
            <Tag color={ROLE_COLOR[user.role]} style={{ margin: 0, fontSize: 11 }}>
              {user.role}
            </Tag>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
              style={{ color: colors.text.secondary }}
            />
          </Flex>
        )}
      </Header>

      {/* ── Mobile Drawer ── */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="left"
        width={248}
        styles={{ body: { padding: 0, background: SIDEBAR_BG, display: 'flex', flexDirection: 'column', height: '100%' }, header: { display: 'none' } }}
        closable={false}
      >
        <Flex align="center" gap={8} style={{ padding: '14px 16px', borderBottom: `1px solid ${SIDEBAR_BORDER}`, flexShrink: 0 }}>
          <Brand collapsed={false} />
        </Flex>
        <div style={{ flex: 1, overflow: 'auto', paddingTop: 8 }}>
          <SidebarMenu collapsed={false} onNavigate={() => setDrawerOpen(false)} />
        </div>
        <UserFooter
          collapsed={false}
          user={footerUser}
          onLogout={async () => { await handleLogout(); setDrawerOpen(false); }}
        />
      </Drawer>

      {/* ── Main Content ── */}
      <Layout
        style={{ marginLeft: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH, transition: 'margin-left 0.2s' }}
        className="main-content-layout"
      >
        <Content
          style={{ padding: '24px', minHeight: '100vh', background: colors.bg.layout }}
          className="main-content"
        >
          <Outlet />
        </Content>
      </Layout>

      <ActorModal />
    </Layout>
  );
}
