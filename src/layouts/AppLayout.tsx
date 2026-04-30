import { useState } from 'react';
import { Layout, Menu, Button, Drawer, Flex, Typography, Divider, Popconfirm, Avatar } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  InboxOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  MenuOutlined,
  DashboardOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '@features/auth/hooks';
import { colors } from '@design-system';

const { Sider, Content, Header } = Layout;

const SIDEBAR_WIDTH = 220;
const SIDEBAR_COLLAPSED_WIDTH = 64;

const SIDEBAR_BG = '#ffffff';
const SIDEBAR_BORDER = colors.border.default;

const navItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'แดชบอร์ด' },
  { key: '/order', icon: <ShoppingCartOutlined />, label: 'บันทึก Order' },
  { key: '/inventory', icon: <InboxOutlined />, label: 'สินค้าคงคลัง' },
  { key: '/employee', icon: <TeamOutlined />, label: 'พนักงาน' },
];

function SidebarMenu({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedKey = navItems.find((item) => location.pathname.startsWith(item.key))?.key ?? '';

  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      inlineCollapsed={collapsed}
      style={{ border: 'none', flex: 1, background: 'transparent' }}
      items={navItems}
      onClick={({ key }) => {
        navigate(key);
        onNavigate?.();
      }}
    />
  );
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Flex align="center" gap={8} style={{ overflow: 'hidden' }}>
      <div style={{
        width: 28, height: 28, borderRadius: 6,
        background: colors.brand.primary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <DashboardOutlined style={{ color: '#fff', fontSize: 14 }} />
      </div>
      {!collapsed && (
        <Typography.Text strong style={{ fontSize: 15, letterSpacing: 0.3, whiteSpace: 'nowrap' }}>
          SLJ ERP
        </Typography.Text>
      )}
    </Flex>
  );
}

function UserFooter({ collapsed, username, onLogout }: { collapsed: boolean; username?: string; onLogout: () => void }) {
  return (
    <div style={{ padding: '12px 8px', borderTop: `1px solid ${SIDEBAR_BORDER}` }}>
      {!collapsed && (
        <Flex align="center" gap={8} style={{ padding: '0 8px 10px' }}>
          <Avatar size={24} icon={<UserOutlined />} style={{ background: colors.brand.primary, flexShrink: 0 }} />
          <Typography.Text style={{ fontSize: 12, color: colors.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {username}
          </Typography.Text>
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
          style={{
            width: '100%',
            textAlign: collapsed ? 'center' : 'left',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          {!collapsed && 'ออกจากระบบ'}
        </Button>
      </Popconfirm>
    </div>
  );
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const siderStyle: React.CSSProperties = {
    background: SIDEBAR_BG,
    borderRight: `1px solid ${SIDEBAR_BORDER}`,
    position: 'fixed',
    left: 0, top: 0, bottom: 0,
    zIndex: 100,
    boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <Sider
        width={SIDEBAR_WIDTH}
        collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
        collapsed={collapsed}
        style={siderStyle}
        className="desktop-sidebar"
      >
        <Flex vertical style={{ height: '100%' }}>
          {/* Brand + collapse toggle */}
          <Flex
            align="center"
            justify={collapsed ? 'center' : 'space-between'}
            style={{
              padding: collapsed ? '14px 0' : '14px 12px 14px 16px',
              borderBottom: `1px solid ${SIDEBAR_BORDER}`,
              minHeight: 56,
            }}
          >
            <Brand collapsed={collapsed} />
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ color: colors.text.tertiary, flexShrink: 0 }}
              size="small"
            />
          </Flex>

          {/* Navigation */}
          <div style={{ flex: 1, overflow: 'auto', paddingTop: 8 }}>
            <SidebarMenu collapsed={collapsed} />
          </div>

          <UserFooter collapsed={collapsed} username={user?.username} onLogout={handleLogout} />
        </Flex>
      </Sider>

      {/* Mobile Header */}
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
          lineHeight: '52px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <Brand collapsed={false} />
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setDrawerOpen(true)}
          style={{ color: colors.text.secondary }}
        />
      </Header>

      {/* Mobile Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="left"
        width={240}
        styles={{ body: { padding: 0, background: SIDEBAR_BG }, header: { display: 'none' } }}
        closable={false}
      >
        <Flex vertical style={{ height: '100%' }}>
          <Flex align="center" gap={8} style={{ padding: '16px', borderBottom: `1px solid ${SIDEBAR_BORDER}` }}>
            <Brand collapsed={false} />
          </Flex>
          <div style={{ flex: 1 }}>
            <SidebarMenu collapsed={false} onNavigate={() => setDrawerOpen(false)} />
          </div>
          <Divider style={{ margin: 0 }} />
          <UserFooter
            collapsed={false}
            username={user?.username}
            onLogout={async () => { await handleLogout(); setDrawerOpen(false); }}
          />
        </Flex>
      </Drawer>

      {/* Main Content */}
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
    </Layout>
  );
}
