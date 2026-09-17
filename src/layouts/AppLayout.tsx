import { useState, useMemo, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DropdownMenu, Tooltip } from 'radix-ui';
import type { Role } from '@features/auth/types';
import { useAuth } from '@features/auth';
import { ActorModal } from '@features/auth';
import { inventoryService } from '@features/inventory/react-query/services';
import { productKeys } from '@features/inventory/react-query/queryKeys';
import { STALE_TIME, notify, useLocalStorage } from '@shared';
import { canAccess, ROLE_COLOR } from '@config/access';
import { APP_CONFIG } from '@config/app.config';
import { AppIcons } from '@/lib/icons';
import { cn } from '@/lib/utils';
import {
  btn,
  btnIcon,
  dataPill,
  DIALOG_CONTENT,
  DIALOG_FOOTER,
  DIALOG_OVERLAY,
  DIALOG_TITLE,
  MENU_CONTENT,
  MENU_ITEM,
  MENU_ITEM_DANGER,
  MENU_SEPARATOR,
  TOOLTIP_CONTENT,
} from '@/lib/styles';

const SIDEBAR_WIDTH = 230;
const SIDEBAR_COLLAPSED_WIDTH = 64;

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
          <Tooltip.Root key={l.key}>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                onClick={() => go(l.key)}
                aria-label={l.label}
                className={cn(
                  'flex size-10 items-center justify-center rounded-md transition-colors [&_svg]:size-5',
                  selectedKey === l.key
                    ? 'bg-primary-subtle text-primary'
                    : 'text-foreground-light hover:bg-surface-200 hover:text-foreground',
                )}
              >
                {l.icon}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content side="right" sideOffset={6} className={TOOLTIP_CONTENT}>
                {l.label}
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
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
              className={cn(LEAF_BASE, 'text-foreground-light hover:bg-surface-200 hover:text-foreground')}
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
                        : 'text-foreground-light hover:bg-surface-200 hover:text-foreground',
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
                : 'text-foreground-light hover:bg-surface-200 hover:text-foreground',
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

/** ไทล์โลโก้ — ไฟล์เป็น WebP ทึบ ต้องมีขอบ+มุมมน ไม่งั้น dark mode เป็นก้อนขาวลอย */
function LogoTile({ className }: { className?: string }) {
  return (
    <img
      src={APP_CONFIG.logoSrc}
      alt=""
      width={32}
      height={32}
      className={cn('size-8 shrink-0 rounded-md border border-border object-cover', className)}
    />
  );
}

function BrandText() {
  return (
    <span className="overflow-hidden text-left">
      <span className="block text-sm font-medium leading-tight tracking-wide whitespace-nowrap text-foreground">
        {APP_CONFIG.shortName}
      </span>
      <span className="block text-[10px] tracking-wide text-foreground-muted">{APP_CONFIG.tagline}</span>
    </span>
  );
}

/** แบรนด์แบบอ่านอย่างเดียว — ใช้ใน header มือถือกับ drawer ที่ไม่มีสถานะย่อ/ขยาย */
function Brand() {
  return (
    <div className="flex items-center gap-2.5 overflow-hidden">
      <LogoTile />
      <BrandText />
    </div>
  );
}

/**
 * โลโก้ = ปุ่มย่อ/ขยาย
 *
 * เดิมเป็นปุ่มแยกที่ตอนย่อถูกดันไปลอยอยู่เหนือ footer (`absolute bottom-18`) ซึ่งหาไม่เจอ
 * และไม่มีอะไรบอกว่าเกี่ยวกับแถบเมนู ตอนนี้รวมเป็นชิ้นเดียว: โลโก้อยู่มุมบนซ้ายเสมอ
 * พอ hover/focus ไอคอนย่อ-ขยายจะ fade ทับตัวโลโก้ — จุดกดอยู่ที่เดิมทั้งสองสถานะ
 * (a11y ไม่ได้พึ่ง hover: เป็น <button> จริง มี aria-label + aria-expanded และ focus ก็ติดสถานะเดียวกัน)
 */
function BrandToggle({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? 'ขยายแถบเมนู' : 'ย่อแถบเมนู'}
      aria-expanded={!collapsed}
      className={cn(
        'group flex items-center gap-2.5 overflow-hidden rounded-md p-1 transition-colors',
        'hover:bg-surface-200 focus-visible:bg-surface-200',
        collapsed ? 'justify-center' : 'w-full',
      )}
    >
      <span className="relative size-8 shrink-0">
        <LogoTile className="transition-opacity duration-(--duration-base) group-hover:opacity-0 group-focus-visible:opacity-0" />
        <span
          aria-hidden
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-md border border-border bg-surface-200',
            'text-foreground-light opacity-0 transition-opacity duration-(--duration-base)',
            'group-hover:opacity-100 group-focus-visible:opacity-100 [&_svg]:size-4.5',
          )}
        >
          {collapsed ? <AppIcons.expandSidebar /> : <AppIcons.collapseSidebar />}
        </span>
      </span>
      {!collapsed && <BrandText />}
    </button>
  );
}

/* ── MenuSearch ─────────────────────────────────────── */

interface SearchHit extends NavLeaf {
  /** ชื่อกลุ่มที่เมนูนี้อยู่ — โชว์เป็นบริบทเวลาชื่อเมนูซ้ำกันข้ามกลุ่ม */
  group?: string;
}

/** เมนูทั้งหมด (แบนแล้ว) ที่ role นี้เข้าถึงได้ — ค้นได้เฉพาะสิ่งที่กดเข้าไปได้จริง */
function searchableLeaves(userRole: Role | undefined): SearchHit[] {
  return visibleNav(userRole).flatMap((s) =>
    'groupKey' in s ? s.children.map((c) => ({ ...c, group: s.label })) : [{ ...s }],
  );
}

/**
 * ช่องค้นหาเมนู — ค้นหาได้จริง ไม่ใช่ช่องประดับ
 *
 * ขอบเขตคือ "เมนู" เท่านั้น (ไม่ใช่สินค้า/คำสั่ง) placeholder จึงเขียนตามที่ทำได้จริง —
 * สัญญาในช่องค้นหาว่าหาสินค้าได้แล้วพิมพ์ชื่อสินค้าไปไม่เจอ แย่กว่าไม่เขียนไว้
 *
 * ผลลัพธ์กรองจาก NAV ที่ผ่าน `canAccess` แล้ว → ไม่มีทางค้นเจอหน้าที่ role ตัวเองเข้าไม่ได้
 */
function MenuSearch() {
  const navigate = useNavigate();
  const userRole = useAuth((s) => s.user?.role);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const leaves = useMemo(() => searchableLeaves(userRole), [userRole]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return leaves
      .filter((l) => `${l.label} ${l.group ?? ''}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [leaves, query]);

  // Ctrl/⌘+K โฟกัสช่องค้นหา — ref ตรงๆ ไม่ต้องพึ่ง getElementById
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function go(hit: SearchHit) {
    navigate(hit.key);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[activeIndex] ?? results[0]);
    }
  }

  return (
    <div
      className="relative hidden w-full max-w-sm lg:block"
      // ปิดเมื่อโฟกัสออกนอกกล่องทั้งก้อน — เช็ค relatedTarget เพื่อไม่ให้ปิดตอนกดผลลัพธ์
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <AppIcons.search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-foreground-muted" />
      <input
        ref={inputRef}
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls="menu-search-results"
        aria-label="ค้นหาเมนู"
        placeholder="ค้นหาเมนู…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="h-8.5 w-full rounded-md border border-border-control bg-control pr-16 pl-9 text-sm text-foreground placeholder:text-foreground-muted"
      />
      <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded-sm border border-border bg-surface-100 px-1.5 py-0.5 font-mono text-xs text-foreground-muted">
        Ctrl K
      </kbd>

      {open && query.trim() !== '' && (
        <div
          id="menu-search-results"
          role="listbox"
          className="absolute inset-x-0 top-full z-(--z-overlay) mt-1 overflow-hidden rounded-md border border-overlay bg-overlay p-1 shadow-overlay"
        >
          {results.length === 0 ? (
            <div className="px-2 py-3 text-center text-sm text-foreground-lighter">
              ไม่พบเมนูที่ตรงกับ “{query.trim()}”
            </div>
          ) : (
            results.map((hit, i) => (
              <button
                key={hit.key}
                type="button"
                role="option"
                aria-selected={i === activeIndex}
                // mouse down ยิงก่อน blur — ไม่งั้นกล่องปิดไปก่อนที่ click จะเกิด
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => go(hit)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm',
                  '[&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-foreground-muted',
                  i === activeIndex ? 'bg-surface-200 text-foreground' : 'text-foreground-light',
                )}
              >
                {hit.icon}
                <span className="flex-1 truncate">{hit.label}</span>
                {hit.group && <span className="text-xs text-foreground-muted">{hit.group}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ── UserMenu ───────────────────────────────────────── */
interface MenuUser { username?: string; terminalCode?: string; role: Role; isTerminal?: boolean }

/**
 * เมนูผู้ใช้มุมบนขวา — รวมทุกอย่างที่เกี่ยวกับตัวตนไว้ที่เดียว
 *
 * เดิมโปรไฟล์กับออกจากระบบเป็นปุ่มค้างอยู่ท้าย sidebar ซึ่งกินพื้นที่เมนูถาวรทั้งที่
 * เป็น action ที่กดนานๆ ครั้ง และตอน sidebar ย่อก็เหลือแค่ไอคอนสองอันที่เดาไม่ออก
 */
function UserMenu({ user, onLogout }: { user: MenuUser | null; onLogout: () => void }) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!user) return null;

  const displayName = user.username ?? user.terminalCode ?? 'ผู้ใช้';

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label={`บัญชีผู้ใช้ ${displayName}`}
            className="flex items-center gap-2 rounded-md p-1 pr-2 transition-colors duration-(--duration-fast) hover:bg-surface-200"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-sm font-medium text-primary">
              {displayName.slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden max-w-28 truncate text-sm text-foreground xl:block">
              {displayName}
            </span>
            <AppIcons.chevronDown className="hidden size-3.5 text-foreground-muted xl:block" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className={cn(MENU_CONTENT, 'w-56')}
            onCloseAutoFocus={(e) => {
              if (confirmOpen) e.preventDefault();
            }}
          >
            <div className="flex flex-col gap-1 px-2 py-1.5">
              <span className="truncate text-sm font-medium text-foreground">{displayName}</span>
              <span className={cn(dataPill(ROLE_COLOR[user.role]), 'self-start')}>
                {user.isTerminal ? `Terminal · ${user.role}` : user.role}
              </span>
            </div>

            <DropdownMenu.Separator className={MENU_SEPARATOR} />

            <DropdownMenu.Item className={MENU_ITEM} onSelect={() => navigate('/profile')}>
              <AppIcons.user />
              โปรไฟล์
            </DropdownMenu.Item>

            <DropdownMenu.Separator className={MENU_SEPARATOR} />

            <DropdownMenu.Item
              className={MENU_ITEM_DANGER}
              onSelect={(e) => {
                // กัน Radix ปิดเมนูเอง แล้วสั่งเปิดโมดัลในจังหวะเดียวกัน (ชนกับ focus trap)
                e.preventDefault();
                setConfirmOpen(true);
              }}
            >
              <AppIcons.logout />
              ออกจากระบบ
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={DIALOG_OVERLAY} />
          <Dialog.Content className={cn(DIALOG_CONTENT, 'max-w-sm')}>
            <Dialog.Title className={DIALOG_TITLE}>ออกจากระบบ?</Dialog.Title>
            <Dialog.Description className="text-sm text-foreground-light">
              ข้อมูลที่ยังไม่ได้บันทึกในหน้าที่เปิดค้างไว้จะหายไป
            </Dialog.Description>
            <div className={DIALOG_FOOTER}>
              <Dialog.Close asChild>
                <button type="button" className={btn()}>
                  ยกเลิก
                </button>
              </Dialog.Close>
              <button type="button" className={btn('danger')} onClick={onLogout}>
                ออกจากระบบ
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

/* ── AppLayout ──────────────────────────────────────── */
export function AppLayout() {
  // จำสถานะย่อ/ขยายข้ามการรีโหลด — คนที่ย่อไว้คือคนที่อยากได้พื้นที่จอ ไม่ใช่อยากกดใหม่ทุกครั้ง
  const [collapsed, setCollapsed] = useLocalStorage('slj:sidebar-collapsed', false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // selector ทีละค่า — AppLayout ห่อทุกหน้า `useAuth()` เปล่าๆ ทำให้ทั้งแอป re-render
  // ทุกครั้งที่ field ใดก็ตามใน auth store ขยับ (รวม isLoadingUser ที่หน้าเพจไม่ได้ใช้)
  const logout = useAuth((s) => s.logout);
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const notifiedRef = useRef(false);

  // ต้องการแค่ "จำนวน" ไม่ใช่ตัวสินค้า → ให้ backend กรอง lowStock แล้วอ่าน pagination.total
  // (เดิมดึง 500 แถวมากรองเองฝั่ง client ซึ่งเกิน MAX_PAGE_LIMIT=200 ของ backend → 400 ทุกหน้า)
  const { data: lowStockCount = 0 } = useQuery({
    queryKey: [...productKeys.all, 'low-stock-count'],
    queryFn: () =>
      inventoryService
        .getAll({ page: 1, limit: 1, isActive: true, lowStock: true })
        .then((r) => r.data.pagination.total),
    staleTime: STALE_TIME.STATIC,
    // role ที่เข้าคลังสินค้าไม่ได้ ก็ทำอะไรกับแจ้งเตือนนี้ไม่ได้ — และ backend จะตอบ 403
    enabled: canAccess(user?.role, '/inventory'),
  });

  useEffect(() => {
    if (notifiedRef.current || lowStockCount === 0) return;
    notifiedRef.current = true;
    notify.warning(
      'สินค้าใกล้หมดสต็อก',
      `มี ${lowStockCount} รายการที่ต่ำกว่าสต็อกขั้นต่ำ — ตรวจสอบที่หน้าสินค้าคงคลัง`,
    );
  }, [lowStockCount]);

  async function handleLogout() {
    await logout();
    queryClient.clear(); // ล้าง cache กันข้อมูลผู้ใช้คนก่อนรั่วไปยังผู้ใช้คนถัดไป
    navigate('/login');
  }

  const menuUser: MenuUser | null = user
    ? { username: user.username, terminalCode: user.terminalCode, role: user.role, isTerminal: user.isTerminal }
    : null;

  const activeLeaf = NAV.flatMap((item) => ('groupKey' in item ? item.children : [item]))
    .sort((a, b) => b.key.length - a.key.length)
    .find((item) => location.pathname === item.key || location.pathname.startsWith(`${item.key}/`));

  // Ctrl/⌘+K ย้ายไปอยู่ใน MenuSearch แล้ว (โฟกัสผ่าน ref ของตัวเอง ไม่ต้องยิง getElementById)

  return (
    // Provider เดียวครอบทั้ง layout — Tooltip.Root ใน sidebar และ topbar ใช้จังหวะหน่วงชุดเดียวกัน
    <Tooltip.Provider delayDuration={300}>
    <div className="min-h-screen">
      {/* ── Desktop Sidebar ── */}
      <aside
        className="desktop-sidebar fixed inset-y-0 left-0 z-100 flex flex-col border-r border-border bg-sidebar transition-[width] duration-200"
        style={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
      >
        {/* header: โลโก้ทำหน้าที่เป็นปุ่มย่อ/ขยายในตัว */}
        <div
          className={cn(
            'flex min-h-14 items-center border-b border-border px-2.5',
            collapsed && 'justify-center',
          )}
        >
          <BrandToggle collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        </div>

        {/* nav — ทุกอย่างที่เกี่ยวกับตัวผู้ใช้ย้ายไปเมนูมุมบนขวาแล้ว sidebar เหลือแค่การนำทาง */}
        <div className="flex-1 overflow-auto py-2">
          <SidebarMenu collapsed={collapsed} />
        </div>
      </aside>

      {/* ── Mobile Header ── */}
      <header className="mobile-header fixed inset-x-0 top-0 z-100 flex h-13 items-center justify-between border-b border-border bg-sidebar px-4">
        <Brand />
        <div className="flex items-center gap-1">
          {/* บนมือถือเมนูผู้ใช้ก็อยู่ขวาบนเหมือนเดสก์ท็อป — ที่เดียวเสมอ ไม่ต้องจำสองที่ */}
          <UserMenu user={menuUser} onLogout={handleLogout} />
          <button
            type="button"
            aria-label="เปิดเมนู"
            onClick={() => setDrawerOpen(true)}
            className={cn(btnIcon('ghost'), 'text-foreground-lighter')}
          >
            <AppIcons.menu />
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-110 md:hidden">
          <div className="absolute inset-0 bg-scrim" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-62 flex-col border-r border-border bg-sidebar shadow-overlay">
            <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3.5">
              <Brand />
            </div>
            <div className="flex-1 overflow-auto py-2">
              <SidebarMenu collapsed={false} onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div
        className="main-content-layout transition-[margin] duration-200"
        style={{ marginLeft: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
      >
        {/* พื้นทึบ ไม่ใช้ bg-background/95 + backdrop-blur — ความลึกมาจากเส้น ไม่ใช่ความโปร่ง
            และ blur ต้อง repaint ทุกครั้งที่เลื่อนเนื้อหาข้างใต้ */}
        <header className="app-topbar sticky top-0 z-50 flex h-14 items-center gap-3 border-b border-border bg-background px-6">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 text-xs text-foreground-muted">
            <span>{APP_CONFIG.shortName}</span>
            <span aria-hidden>/</span>
            <span className="truncate text-foreground-light">{activeLeaf?.label ?? 'ภาพรวม'}</span>
          </div>

          <MenuSearch />

          {canAccess(user?.role, '/inventory') && (
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                {/* จุดแจ้งเตือนอยู่นอกปุ่ม — ถ้าใส่เป็น children ปุ่มจะเลิกเป็น icon-only
                    แล้วเปลี่ยนความกว้างไปมาตามว่ามีแจ้งเตือนหรือไม่ */}
                <span className="relative inline-flex">
                  <button
                    type="button"
                    aria-label={
                      lowStockCount > 0 ? `การแจ้งเตือน (${lowStockCount})` : 'การแจ้งเตือน'
                    }
                    onClick={() => navigate('/inventory')}
                    className={btnIcon('ghost')}
                  >
                    <AppIcons.alert />
                  </button>
                  {lowStockCount > 0 && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute top-1 right-1 size-2 rounded-full border-2 border-background bg-primary"
                    />
                  )}
                </span>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content side="bottom" sideOffset={6} className={TOOLTIP_CONTENT}>
                  {lowStockCount > 0
                    ? `สินค้าใกล้หมด ${lowStockCount} รายการ — ไปหน้าคลังสินค้า`
                    : 'ไม่มีสินค้าใกล้หมด'}
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          )}

          <UserMenu user={menuUser} onLogout={handleLogout} />
        </header>

        <main className="main-content min-h-[calc(100vh-3.5rem)] bg-canvas p-6">
          <Outlet />
        </main>
      </div>

      <ActorModal />
    </div>
    </Tooltip.Provider>
  );
}
