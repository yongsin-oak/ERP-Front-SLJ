/**
 * Class-string vocabulary สำหรับ UI ทั้งระบบ — ใช้คู่กับ Radix primitives ที่ import ตรงในเพจ
 *
 * ทำไมเป็น "string constant" ไม่ใช่ "component":
 *   โปรเจกต์เลิกใช้ชั้น wrapper (design-system / components/ui) แล้ว หน้าเพจประกอบ
 *   Radix เองทั้งหมด แต่ถ้าปล่อยให้แต่ละเพจเขียน class เอง สีแบรนด์/ขอบ/ความสูงจะหลุด
 *   กันคนละชุด และแก้ทีเดียวไม่ได้ ไฟล์นี้จึงเป็น "แหล่งเดียวของหน้าตา" โดยไม่บังคับโครง JSX
 *
 * ต่อยอดจาก fieldStyles.ts (สูตรขอบ field) — ที่นี่คือส่วนที่เหลือทั้งหมด
 * โทเคนสีทั้งหมดมาจาก src/index.css (3-tier) — ห้ามใส่ #hex หรือ px ตรงนี้
 */

import { FIELD_BORDER } from './fieldStyles';

/* ── Button ──────────────────────────────────────────────────────────────────
   ใช้กับ <button> ตรงๆ หรือ Radix *.Trigger ที่ asChild ครอบ <button> */

export const BTN_BASE =
  "inline-flex shrink-0 items-center justify-center rounded-md border bg-clip-padding text-sm font-medium whitespace-nowrap transition-colors duration-(--duration-fast) ease-out outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-stronger disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5";

export const BTN_VARIANT = {
  /** action หลักของหน้า — สีแบรนด์ (แดง) */
  primary:
    'border-primary bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
  /** action รอง — ขอบ + พื้นโปร่ง */
  secondary:
    'border-border-control bg-transparent hover:bg-accent hover:text-accent-foreground active:bg-accent-active aria-expanded:bg-accent aria-expanded:text-accent-foreground',
  /** พื้นเทาอ่อน — ใช้เป็นปุ่มกลางระหว่าง primary กับ secondary */
  tonal:
    'border-border bg-surface-100 text-secondary-foreground hover:bg-surface-200 active:bg-surface-300 aria-expanded:bg-surface-200',
  /** ไม่มีขอบ ไม่มีพื้น — ปุ่ม icon ในตาราง/toolbar */
  ghost:
    'border-transparent hover:bg-accent hover:text-accent-foreground active:bg-accent-active aria-expanded:bg-accent aria-expanded:text-accent-foreground',
  /** ลบ/ทำลาย — ทึบแดง */
  danger:
    'border-destructive bg-destructive text-destructive-foreground hover:bg-destructive-hover active:bg-destructive-active focus-visible:outline-destructive',
  /** ลบ แบบไม่เด่น — outline แดง เหมาะใน row action */
  dangerGhost:
    'border-destructive/30 bg-transparent text-destructive hover:bg-error-bg active:bg-error-border/40 focus-visible:outline-destructive',
  link: 'border-transparent text-primary underline-offset-4 hover:underline',
} as const;

export const BTN_SIZE = {
  xs: "h-6.5 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
  sm: 'h-7.5 gap-1 px-2.5',
  md: 'h-8.5 gap-1.5 px-3',
  lg: "h-9.5 gap-1.5 px-3.5 [&_svg:not([class*='size-'])]:size-4",
} as const;

/** ปุ่มที่มีแต่ icon — ต้องมี aria-label เสมอ */
export const BTN_ICON_SIZE = {
  xs: "size-6.5 [&_svg:not([class*='size-'])]:size-3",
  sm: 'size-7.5',
  md: 'size-8.5',
  lg: "size-9.5 [&_svg:not([class*='size-'])]:size-4",
} as const;

export type BtnVariant = keyof typeof BTN_VARIANT;
export type BtnSize = keyof typeof BTN_SIZE;

/** helper: ประกอบ class ปุ่มในบรรทัดเดียว — `<button className={btn('primary')}>` */
export function btn(variant: BtnVariant = 'secondary', size: BtnSize = 'md') {
  return `${BTN_BASE} ${BTN_VARIANT[variant]} ${BTN_SIZE[size]}`;
}

/** helper: ปุ่ม icon-only */
export function btnIcon(variant: BtnVariant = 'ghost', size: BtnSize = 'md') {
  return `${BTN_BASE} ${BTN_VARIANT[variant]} ${BTN_ICON_SIZE[size]}`;
}

/* ── Text input / textarea ───────────────────────────────────────────────── */

export const INPUT =
  `flex h-8.5 w-full min-w-0 rounded-md bg-control px-3 py-1 text-sm text-foreground ease-out placeholder:text-foreground-muted selection:bg-primary selection:text-primary-foreground ${FIELD_BORDER}`;

export const INPUT_SM =
  `flex h-7.5 w-full min-w-0 rounded-md bg-control px-2.5 py-1 text-sm text-foreground ease-out placeholder:text-foreground-muted selection:bg-primary selection:text-primary-foreground ${FIELD_BORDER}`;

export const TEXTAREA =
  `flex field-sizing-content min-h-16 w-full rounded-md bg-control px-3 py-2 text-sm text-foreground ease-out placeholder:text-foreground-muted selection:bg-primary selection:text-primary-foreground ${FIELD_BORDER}`;

/** กล่องที่ห่อ <input> ไว้ (มี prefix/suffix) — โฟกัสเกิดที่ลูก */
export const INPUT_WRAP =
  `flex h-8.5 w-full items-center gap-2 rounded-md bg-control px-3 text-sm text-foreground [&>input]:min-w-0 [&>input]:flex-1 [&>input]:bg-transparent [&>input]:outline-none [&>input]:placeholder:text-foreground-muted ${FIELD_BORDER.replace(/focus-visible:/g, 'focus-within:')}`;

/** ตัวเลขในช่องกรอก — ชิดขวา + mono ให้หลักตรงกัน */
export const INPUT_NUMBER = `${INPUT} text-right font-mono tabular-nums`;

/* ── Label / field chrome ────────────────────────────────────────────────── */

export const LABEL = 'text-sm font-medium text-foreground-light';
export const LABEL_REQUIRED = "after:ml-0.5 after:text-destructive after:content-['*']";
export const FIELD_HINT = 'text-xs text-foreground-muted';
export const FIELD_ERROR = 'text-xs text-destructive';
/** ระยะระหว่าง label → control → hint ของ 1 field */
export const FIELD_ROW = 'flex flex-col gap-1.5';

/* ── Select (Radix Select) ──────────────────────────────────────────────── */

export const SELECT_TRIGGER =
  `flex h-8.5 w-full items-center justify-between gap-2 rounded-md bg-control px-3 text-sm text-foreground data-placeholder:text-foreground-muted [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 [&_svg:not([class*='text-'])]:text-foreground-muted ${FIELD_BORDER}`;

export const SELECT_CONTENT =
  'relative z-(--z-overlay) max-h-(--radix-select-content-available-height) min-w-32 origin-(--radix-select-content-transform-origin) overflow-hidden rounded-md border border-overlay bg-overlay text-popover-foreground shadow-overlay outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1';

export const SELECT_VIEWPORT =
  'p-1 h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width) scroll-my-1';

export const SELECT_ITEM =
  "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none focus:bg-surface-200 focus:text-foreground data-[state=checked]:font-medium data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5";

export const SELECT_LABEL = 'px-2 py-1.5 text-xs font-medium text-foreground-lighter';
export const SELECT_SEPARATOR = '-mx-1 my-1 h-px bg-border-muted';

/* ── Dialog (Radix Dialog) — ใช้แทนทั้ง Modal และ Drawer ─────────────────── */

export const DIALOG_OVERLAY =
  'fixed inset-0 z-(--z-overlay) bg-scrim backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0';

export const DIALOG_CONTENT =
  'fixed top-1/2 left-1/2 z-(--z-overlay) grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border border-overlay bg-overlay p-5 text-sm shadow-overlay outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95';

/** ตัวใหญ่ — modal ที่มีตารางข้างใน */
export const DIALOG_CONTENT_LG = DIALOG_CONTENT.replace('max-w-lg', 'max-w-3xl');
export const DIALOG_CONTENT_XL = DIALOG_CONTENT.replace('max-w-lg', 'max-w-5xl');

/** Drawer — เลื่อนเข้าจากขอบขวา */
export const DRAWER_CONTENT =
  'fixed inset-y-0 right-0 z-(--z-overlay) flex w-full max-w-md flex-col gap-4 border-l border-overlay bg-overlay p-5 text-sm shadow-overlay outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right';

export const DIALOG_TITLE = 'font-heading text-base font-medium text-foreground';
export const DIALOG_DESC = 'text-sm text-foreground-lighter';
export const DIALOG_FOOTER = 'flex items-center justify-end gap-2 pt-1';
export const DIALOG_CLOSE_X =
  'absolute top-4 right-4 rounded-md p-1 text-foreground-muted transition-colors hover:bg-surface-200 hover:text-foreground';

/* ── Dropdown / Popover / Context menu ──────────────────────────────────── */

export const MENU_CONTENT =
  'z-(--z-overlay) min-w-40 origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border border-overlay bg-overlay p-1 text-popover-foreground shadow-overlay outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95';

export const MENU_ITEM =
  "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none focus:bg-surface-200 focus:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:text-foreground-muted";

/** รายการทำลาย — อยู่ล่างสุดของเมนูเสมอ */
export const MENU_ITEM_DANGER =
  "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive outline-none select-none focus:bg-error-bg focus:text-destructive data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:text-destructive";

export const MENU_SEPARATOR = '-mx-1 my-1 h-px bg-border-muted';
export const MENU_LABEL = 'px-2 py-1.5 text-xs font-medium text-foreground-lighter';

export const POPOVER_CONTENT =
  'z-(--z-overlay) rounded-md border border-overlay bg-overlay p-3 text-sm text-popover-foreground shadow-overlay outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95';

export const TOOLTIP_CONTENT =
  'z-(--z-overlay) rounded-md bg-foreground px-2 py-1 text-xs text-canvas shadow-overlay data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0';

/* ── Checkbox / Radio / Switch (Radix) ──────────────────────────────────── */

export const CHECKBOX =
  'peer size-4 shrink-0 rounded-[0.25rem] border border-border-control bg-control transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-stronger data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50';

export const RADIO =
  'aspect-square size-4 shrink-0 rounded-full border border-border-control bg-control transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-stronger data-[state=checked]:border-primary disabled:cursor-not-allowed disabled:opacity-50';

export const RADIO_INDICATOR =
  'flex size-full items-center justify-center after:block after:size-2 after:rounded-full after:bg-primary';

export const SWITCH =
  'peer inline-flex h-4.5 w-8 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-surface-300 transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-stronger data-[state=checked]:bg-primary disabled:cursor-not-allowed disabled:opacity-50';

export const SWITCH_THUMB =
  'pointer-events-none block size-3.5 rounded-full bg-canvas ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-0.125rem)] data-[state=unchecked]:translate-x-0.5';

/* ── Tabs / ToggleGroup (Radix) ─────────────────────────────────────────── */

export const TABS_LIST = 'inline-flex h-auto items-center gap-4 border-b border-border';
export const TABS_TRIGGER =
  'relative -mb-px inline-flex items-center gap-1.5 border-b-2 border-transparent px-0.5 pb-2 text-sm text-foreground-lighter transition-colors outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-stronger data-[state=active]:border-primary data-[state=active]:font-medium data-[state=active]:text-foreground';

/** Segmented control — ToggleGroup แบบ single */
export const SEGMENTED_ROOT =
  'inline-flex items-center gap-0.5 rounded-md border border-border-control bg-surface-100 p-0.5';
export const SEGMENTED_ITEM =
  'inline-flex h-6.5 items-center gap-1 rounded-sm px-2.5 text-xs font-medium text-foreground-lighter transition-colors outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-stronger data-[state=on]:bg-canvas data-[state=on]:text-foreground';

/* ── Surfaces: panel / card / table ─────────────────────────────────────── */

/** แผงหลัก — ความลึกมาจากขอบ + ชั้นพื้นผิว ไม่ใช่เงา */
export const PANEL = 'rounded-lg border border-border bg-surface-100';
export const CARD = 'rounded-lg border border-border bg-card p-5 text-sm text-card-foreground';
export const CARD_SM = 'rounded-lg border border-border bg-card p-4 text-sm text-card-foreground';
export const CARD_TITLE = 'font-heading text-base font-medium text-foreground';
export const CARD_DESC = 'text-sm text-foreground-lighter';

export const TABLE_WRAP = 'w-full overflow-x-auto rounded-lg border border-border bg-surface-100';
export const TABLE = 'w-full caption-bottom border-collapse text-sm';
export const TABLE_TH =
  'h-9 border-b border-border bg-surface-200 px-3 text-left align-middle text-xs font-medium whitespace-nowrap text-foreground-lighter';
export const TABLE_TD = 'border-b border-border-muted px-3 py-2.5 align-middle';
export const TABLE_TR = 'transition-colors hover:bg-surface-200/60 data-[selected=true]:bg-primary-subtle';
/** แถวว่าง / โหลด — กินเต็มความกว้าง */
export const TABLE_EMPTY = 'px-3 py-12 text-center text-sm text-foreground-muted';
/** ตัวเลขในตาราง — mono ให้หลักตรงกัน */
export const CELL_NUM = 'text-right font-mono tabular-nums';
export const CELL_CODE = 'font-mono text-xs tabular-nums text-foreground-light';

/* ── Tag / Badge — สถานะ ────────────────────────────────────────────────── */

export const TAG_BASE =
  'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 rounded-full border border-transparent px-2 text-xs font-medium whitespace-nowrap';

export const TAG_TONE = {
  neutral: 'bg-surface-200 text-foreground-light',
  brand: 'bg-primary-subtle text-primary',
  success: 'bg-success-bg text-success-text',
  warning: 'bg-warning-bg text-warning-text',
  danger: 'bg-error-bg text-destructive',
  info: 'bg-info-bg text-info-text',
  outline: 'border-border text-foreground-light',
} as const;

export type TagTone = keyof typeof TAG_TONE;

export function tag(tone: TagTone = 'neutral') {
  return `${TAG_BASE} ${TAG_TONE[tone]}`;
}

/** pill ทรงเหลี่ยม — ใช้ในตารางที่มี tag หลายอันเรียงกัน วงกลมจะกินที่เกินไป */
export const PILL_BASE =
  'inline-flex items-center gap-1 rounded-md border px-2 py-px text-xs font-medium leading-5 whitespace-nowrap';

/**
 * จานสีเชิงหมวดหมู่ — ใช้ตอนค่าที่แสดง "ไม่มีความหมายดี/ร้าย" แค่ต้องแยกออกจากกัน
 * (เช่น role, ประเภทเอกสาร) ถ้าเป็นสถานะดี/ร้ายให้ใช้ TAG_TONE แทน
 * เขียนเป็น class เต็มๆ เพื่อให้ Tailwind สแกนเจอ — ห้ามต่อ string เอง
 */
export const DATA_TAG = {
  red: 'bg-data-red-bg border-data-red-border text-data-red-text',
  volcano: 'bg-data-volcano-bg border-data-volcano-border text-data-volcano-text',
  orange: 'bg-data-orange-bg border-data-orange-border text-data-orange-text',
  gold: 'bg-data-gold-bg border-data-gold-border text-data-gold-text',
  yellow: 'bg-data-yellow-bg border-data-yellow-border text-data-yellow-text',
  lime: 'bg-data-lime-bg border-data-lime-border text-data-lime-text',
  green: 'bg-data-green-bg border-data-green-border text-data-green-text',
  cyan: 'bg-data-cyan-bg border-data-cyan-border text-data-cyan-text',
  blue: 'bg-data-blue-bg border-data-blue-border text-data-blue-text',
  geekblue: 'bg-data-geekblue-bg border-data-geekblue-border text-data-geekblue-text',
  purple: 'bg-data-purple-bg border-data-purple-border text-data-purple-text',
  magenta: 'bg-data-magenta-bg border-data-magenta-border text-data-magenta-text',
  default: 'bg-data-default-bg border-data-default-border text-data-default-text',
} as const;

export type DataColor = keyof typeof DATA_TAG;

/** pill สถานะเชิงความหมาย — มีขอบ ใช้ในตาราง */
export const STATUS_TAG = {
  success: 'bg-success-bg border-success-border text-success-text',
  warning: 'bg-warning-bg border-warning-border text-warning-text',
  error: 'bg-error-bg border-error-border text-error-text',
  info: 'bg-info-bg border-info-border text-info-text',
  default: 'bg-surface-200 border-border text-foreground-lighter',
} as const;

export type StatusTone = keyof typeof STATUS_TAG;

export function statusPill(tone: StatusTone = 'default') {
  return `${PILL_BASE} ${STATUS_TAG[tone]}`;
}

export function dataPill(color: DataColor = 'default') {
  return `${PILL_BASE} ${DATA_TAG[color]}`;
}

/* ── Alert / Banner ─────────────────────────────────────────────────────── */

export const ALERT_BASE =
  "flex w-full items-start gap-2.5 rounded-md border px-3 py-2.5 text-sm [&_svg]:mt-0.5 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

export const ALERT_TONE = {
  info: 'border-info-border bg-info-bg text-info-text',
  success: 'border-success-border bg-success-bg text-success-text',
  warning: 'border-warning-border bg-warning-bg text-warning-text',
  danger: 'border-error-border bg-error-bg text-destructive',
} as const;

export type AlertTone = keyof typeof ALERT_TONE;

export function alertBox(tone: AlertTone = 'info') {
  return `${ALERT_BASE} ${ALERT_TONE[tone]}`;
}

/* ── Page chrome ────────────────────────────────────────────────────────── */

export const PAGE = 'flex flex-col gap-4 p-4 md:p-6';
export const PAGE_HEADER = 'flex flex-wrap items-center justify-between gap-3';
export const PAGE_TITLE = 'font-heading text-xl font-semibold text-foreground';
export const PAGE_SUBTITLE = 'text-sm text-foreground-lighter';
export const TOOLBAR = 'flex flex-wrap items-center gap-2';

/* ── Typography ─────────────────────────────────────────────────────────── */

export const TEXT = {
  base: 'text-sm text-foreground',
  muted: 'text-sm text-foreground-lighter',
  subtle: 'text-xs text-foreground-muted',
  strong: 'text-sm font-medium text-foreground',
  danger: 'text-sm text-destructive',
  /** SKU / เลขเอกสาร / วันที่ / ตัวเลข */
  mono: 'font-mono text-sm tabular-nums',
} as const;

export const HEADING = {
  page: 'font-heading text-xl font-semibold text-foreground',
  section: 'font-heading text-base font-medium text-foreground',
  sub: 'text-sm font-medium text-foreground-light',
} as const;

/* ── Misc ───────────────────────────────────────────────────────────────── */

export const SEPARATOR_H = 'h-px w-full shrink-0 bg-border';
export const SEPARATOR_V = 'w-px self-stretch shrink-0 bg-border';
export const SKELETON = 'animate-pulse rounded-md bg-surface-300';
export const SPINNER = 'animate-spin text-foreground-muted';
/** สถานะว่าง — ต้องมี CTA เสมอ */
export const EMPTY_WRAP = 'flex flex-col items-center justify-center gap-3 px-4 py-12 text-center';
export const EMPTY_TEXT = 'text-sm text-foreground-muted';
/** แถบเลือกหลายรายการ — ลอยเหนือตาราง */
export const BULK_BAR =
  'flex flex-wrap items-center gap-2 rounded-md border border-primary/30 bg-primary-subtle px-3 py-2 text-sm';
