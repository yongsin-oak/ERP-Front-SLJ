import { useState, useMemo, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Role } from '@features/auth/types';
import { useAuth } from '@features/auth';
import { ActorModal } from '@features/auth';
import { AppIcons, Button, Tag, Tooltip } from '@design-system';
import { inventoryService } from '@features/inventory/react-query/services';
import { productKeys } from '@features/inventory/react-query/queryKeys';
import { STALE_TIME, notify } from '@shared';
import { canAccess } from '@config/access';
import { cn } from '@/lib/utils';

const SIDEBAR_WIDTH = 230;
const SIDEBAR_COLLAPSED_WIDTH = 64;

const ROLE_COLOR: Record<Role, string> = {
  SuperAdmin: 'red', Admin: 'orange', Operator: 'blue', Warehouse: 'cyan',
  Accountant: 'green', HR: 'purple', Marketing: 'magenta', Sales: 'gold',
};

/* ── Nav tree ──────────────────────────────────────── */
interface NavLeaf {
  key: string;
  icon: React.ReactNode;
  label: string;
}

interface NavGroup {
  groupKey: string;
  icon: React.ReactNode;
  label: string;
  children: NavLeaf[];
}

type NavSection = NavLeaf | NavGroup;

const NAV: NavSection[] = [
  { key: '/dashboard', icon: <AppIcons.dashboard />, label: 'แดชบอร์ด' },
  { key: '/report', icon: <AppIcons.report size={16} />, label: 'รายงาน' },
  {
    groupKey: 'order',
    icon: <AppIcons.cart />,
    label: 'Order',
    children: [
      { key: '/order',         icon: <AppIcons.add />,    label: 'บันทึก Order' },
      { key: '/order/history', icon: <AppIcons.history />, label: 'ประวัติ Order' },
    ],
  },
  {
    groupKey: 'inventory',
    icon: <AppIcons.inbox />,
    label: 'สินค้า',
    children: [
      { key: '/inventory', icon: <AppIcons.barcode />,   label: 'คลังสินค้า' },
      { key: '/brand',     icon: <AppIcons.tags />,      label: 'แบรนด์' },
      { key: '/category',  icon: <AppIcons.grid />,  label: 'หมวดหมู่' },
    ],
  },
  {
    groupKey: 'stock',
    icon: <AppIcons.container />,
    label: 'สต็อก',
    children: [
      { key: '/stock/receive', icon: <AppIcons.download />,      label: 'รับสินค้าเข้า' },
      { key: '/stock/damage',  icon: <AppIcons.damage />,          label: 'บันทึกของเสีย' },
      { key: '/stock/adjust',  icon: <AppIcons.adjust />,       label: 'ปรับสต็อก' },
      { key: '/stock/history', icon: <AppIcons.list />, label: 'ประวัติสต็อก' },
      { key: '/stock/count',   icon: <AppIcons.stockCount size={16} />, label: 'นับสต็อก' },
    ],
  },
  {
    groupKey: 'management',
    icon: <AppIcons.employees />,
    label: 'จัดการ',
    children: [
      { key: '/shop',     icon: <AppIcons.shop />,  label: 'ร้านค้า' },
      { key: '/employee', icon: <AppIcons.employees />,  label: 'พนักงาน' },
      { key: '/supplier', icon: <AppIcons.delivery />, label: 'ซัพพลายเออร์' },
    ],
  },
  {
    groupKey: 'system',
    icon: <AppIcons.settings />,
    label: 'ระบบ',
    children: [
      { key: '/user',     icon: <AppIcons.user />,              label: 'ผู้ใช้งาน' },
      { key: '/terminal', icon: <AppIcons.desktop />,           label: 'Terminal' },
      { key: '/role',     icon: <AppIcons.roles />, label: 'บทบาท' },
    ],
  },
];

function visibleNav(userRole: Role | undefined): NavSection[] {
  return NAV.flatMap((section): NavSection[] => {
    if ('groupKey' in section) {
      const children = section.children.filter((c) => canAccess(userRole, c.key));
      return children.length ? [{ ...section, children }] : [];
    }
    return canAccess(userRole, section.key) ? [section] : [];
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

const LEAF_BASE =
  'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors [&_svg]:size-4.5 [&_svg]:shrink-0';

/* ── SidebarMenu ───────────────────────────────────── */
function SidebarMenu({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = useAuth((s) => s.user?.role);

  const sections = useMemo(() => visibleNav(userRole), [userRole]);
  const selectedKey = useMemo(() => getActiveLeafKey(location.pathname), [location.pathname]);
  const [open, setOpen] = useState<string[]>(() => getInitialOpenKeys(location.pathname));

  function go(key: string) {
    navigate(key);
    onNavigate?.();
  }

  if (collapsed) {
    const leaves = sections.flatMap((s) => ('groupKey' in s ? s.children : [s]));
    return (
      <div className="flex flex-col items-center gap-1 px-2">
        {leaves.map((l) => (
          <Tooltip key={l.key} title={l.label} placement="right">
            <button
              type="button"
              onClick={() => go(l.key)}
              className={cn(
                'flex size-10 items-center justify-center rounded-md transition-colors [&_svg]:size-5',
                selectedKey === l.key
                  ? 'bg-primary-subtle text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {l.icon}
            </button>
          </Tooltip>
        ))}
      </div>
    );
  }

  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {sections.map((s) =>
        'groupKey' in s ? (
          <div key={s.groupKey}>
            <button
              type="button"
              onClick={() =>
                setOpen((o) =>
                  o.includes(s.groupKey) ? o.filter((k) => k !== s.groupKey) : [...o, s.groupKey],
                )
              }
              className={cn(LEAF_BASE, 'text-muted-foreground hover:bg-accent hover:text-foreground')}
            >
              {s.icon}
              <span className="flex-1 text-left">{s.label}</span>
              <AppIcons.chevronDown
                className={cn('size-4 transition-transform', open.includes(s.groupKey) && 'rotate-180')}
              />
            </button>
            {open.includes(s.groupKey) && (
              <div className="mt-0.5 flex flex-col gap-0.5">
                {s.children.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => go(c.key)}
                    className={cn(
                      LEAF_BASE,
                      'pl-9',
                      selectedKey === c.key
                        ? 'bg-primary-subtle font-medium text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    {c.icon}
                    <span className="flex-1 text-left">{c.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            key={s.key}
            type="button"
            onClick={() => go(s.key)}
            className={cn(
              LEAF_BASE,
              selectedKey === s.key
                ? 'bg-primary-subtle font-medium text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {s.icon}
            <span className="flex-1 text-left">{s.label}</span>
          </button>
        ),
      )}
    </nav>
  );
}

/* ── Brand ─────────────────────────────────────────── */
function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-2.5 overflow-hidden">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-[0_2px_8px_rgba(224,40,46,0.33)]">
        S
      </div>
      {!collapsed && (
        <div className="overflow-hidden">
          <div className="block text-sm font-semibold leading-tight tracking-wide whitespace-nowrap text-foreground">
            SLJ ERP
          </div>
          <div className="block text-[10px] tracking-wide text-foreground-subtle">Management System</div>
        </div>
      )}
    </div>
  );
}

/* ── UserFooter ─────────────────────────────────────── */
interface FooterUser { username?: string; terminalCode?: string; role: Role; isTerminal?: boolean }

function UserFooter({ collapsed, user, onLogout, onProfile }: {
  collapsed: boolean;
  user: FooterUser | null;
  onLogout: () => void;
  onProfile: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="border-t border-border px-2 pt-2.5 pb-2">
      {!collapsed && user && (
        <div className="flex items-center gap-2.5 px-2 pt-1 pb-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground [&_svg]:size-4">
            <AppIcons.user />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="block truncate text-sm font-semibold leading-tight text-foreground">
              {user.username ?? user.terminalCode}
            </div>
            <Tag color={ROLE_COLOR[user.role]} className="mt-0.5">
              {user.isTerminal ? `Terminal · ${user.role}` : user.role}
            </Tag>
          </div>
        </div>
      )}
      <Button
        variant="ghost"
        block
        icon={<AppIcons.user />}
        onClick={onProfile}
        className={cn('mb-0.5', collapsed ? 'justify-center' : 'justify-start')}
      >
        {!collapsed && 'โปรไฟล์'}
      </Button>

      <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="danger-ghost"
            block
            icon={<AppIcons.logout />}
            className={cn(collapsed ? 'justify-center' : 'justify-start')}
          >
            {!collapsed && 'ออกจากระบบ'}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-48 p-3">
          <div className="text-sm font-medium text-foreground">ออกจากระบบ?</div>
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" size="small" onClick={() => setConfirmOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              variant="danger"
              size="small"
              onClick={() => {
                setConfirmOpen(false);
                onLogout();
              }}
            >
              ออกจากระบบ
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/* ── AppLayout ──────────────────────────────────────── */
export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notifiedRef = useRef(false);

  const { data: lowStockProducts } = useQuery({
    queryKey: [...productKeys.all, 'low-stock'],
    queryFn: () =>
      inventoryService.getAll({ page: 1, limit: 500, isActive: true }).then((r) =>
        r.data.data.filter((p) => p.minStock != null && p.remaining < p.minStock),
      ),
    staleTime: STALE_TIME.STATIC,
  });

  useEffect(() => {
    if (notifiedRef.current || !lowStockProducts?.length) return;
    notifiedRef.current = true;
    notify.warning(
      'สินค้าใกล้หมดสต็อก',
      `มี ${lowStockProducts.length} รายการที่ต่ำกว่าสต็อกขั้นต่ำ — ตรวจสอบที่หน้าสินค้าคงคลัง`,
    );
  }, [lowStockProducts]);

  async function handleLogout() {
    await logout();
    queryClient.clear(); // ล้าง cache กันข้อมูลผู้ใช้คนก่อนรั่วไปยังผู้ใช้คนถัดไป
    navigate('/login');
  }

  const footerUser: FooterUser | null = user
    ? { username: user.username, terminalCode: user.terminalCode, role: user.role, isTerminal: user.isTerminal }
    : null;

  return (
    <div className="min-h-screen">
      {/* ── Desktop Sidebar ── */}
      <aside
        className="desktop-sidebar fixed inset-y-0 left-0 z-100 flex flex-col border-r border-border bg-background shadow-[2px_0_8px_rgba(0,0,0,0.04)] transition-[width] duration-200"
        style={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
      >
        {/* header: brand + collapse toggle */}
        <div
          className={cn(
            'flex min-h-14 items-center border-b border-border',
            collapsed ? 'justify-center px-0 py-3.5' : 'justify-between py-3 pr-2.5 pl-3.5',
          )}
        >
          <Brand collapsed={collapsed} />
          <Button
            variant="ghost"
            size="small"
            className={cn('shrink-0 text-foreground-subtle', collapsed && 'absolute bottom-18 left-0 right-0 mx-auto w-10')}
            icon={collapsed ? <AppIcons.expandSidebar /> : <AppIcons.collapseSidebar />}
            onClick={() => setCollapsed((c) => !c)}
          />
        </div>

        {/* nav */}
        <div className="flex-1 overflow-auto py-2">
          <SidebarMenu collapsed={collapsed} />
        </div>

        <UserFooter
          collapsed={collapsed}
          user={footerUser}
          onLogout={handleLogout}
          onProfile={() => navigate('/profile')}
        />
      </aside>

      {/* ── Mobile Header ── */}
      <header className="mobile-header fixed inset-x-0 top-0 z-100 flex h-13 items-center justify-between border-b border-border bg-background px-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <Brand collapsed={false} />
        {user && (
          <div className="flex items-center gap-2">
            <Tag color={ROLE_COLOR[user.role]}>{user.role}</Tag>
            <Button
              variant="ghost"
              icon={<AppIcons.menu />}
              onClick={() => setDrawerOpen(true)}
              className="text-muted-foreground"
            />
          </div>
        )}
      </header>

      {/* ── Mobile Drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-110 md:hidden">
          <div className="absolute inset-0 bg-scrim" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-62 flex-col bg-background shadow-overlay">
            <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3.5">
              <Brand collapsed={false} />
            </div>
            <div className="flex-1 overflow-auto py-2">
              <SidebarMenu collapsed={false} onNavigate={() => setDrawerOpen(false)} />
            </div>
            <UserFooter
              collapsed={false}
              user={footerUser}
              onLogout={async () => {
                await handleLogout();
                setDrawerOpen(false);
              }}
              onProfile={() => {
                navigate('/profile');
                setDrawerOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div
        className="main-content-layout transition-[margin] duration-200"
        style={{ marginLeft: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
      >
        <main className="main-content min-h-screen bg-canvas p-6">
          <Outlet />
        </main>
      </div>

      <ActorModal />
    </div>
  );
}
