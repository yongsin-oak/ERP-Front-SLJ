import { useMemo, useState } from 'react';
import { AlertDialog, DropdownMenu } from 'radix-ui';
import { useSearchState, PAGINATION } from '@shared';
import { ROLE_COLOR } from '@config/access';
import { AppIcons } from '@/lib/icons';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  btn,
  btnIcon,
  CELL_CODE,
  dataPill,
  DIALOG_CONTENT,
  DIALOG_DESC,
  DIALOG_FOOTER,
  DIALOG_OVERLAY,
  DIALOG_TITLE,
  DOT,
  DOT_BASE,
  DOT_TONE,
  MENU_CONTENT,
  MENU_ITEM,
  MENU_ITEM_DANGER,
  MENU_SEPARATOR,
  PAGE_HEADER,
  PAGE_SIZE_SELECT,
  PAGE_SUBTITLE,
  PAGE_TITLE,
  PAGER,
  STAT_CARD,
  STAT_LABEL,
  STAT_SUFFIX,
  STAT_VALUE,
  TABLE,
  TABLE_EMPTY,
  TABLE_TD,
  TABLE_TH,
  TABLE_TR,
  TABLE_WRAP,
  TEXT,
} from '@/lib/styles';
import {
  useTerminalList,
  useCreateTerminal,
  useUpdateTerminal,
  useDeleteTerminal,
} from '../react-query';
import { TerminalFormModal } from '../components/TerminalFormModal';
import type { Terminal, CreateTerminalDto, UpdateTerminalDto } from '../types';

// annotate เป็น number ตรงๆ — PAGINATION เป็น `as const` ค่าเลยเป็น literal type
const LIST_DEFAULTS: { page: number; pageSize: number } = {
  page: PAGINATION.DEFAULT_PAGE,
  pageSize: PAGINATION.DEFAULT_LIMIT,
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const CREATED_AT_FORMAT = 'DD/MM/YY HH:mm';

export function TerminalPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Terminal | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Terminal | null>(null);

  // แบ่งหน้าฝั่ง server — ไม่ดึง terminal ทั้งหมดมาไว้ในหน่วยความจำ
  const [tableState, setTableState] = useSearchState('terminal-list', LIST_DEFAULTS);
  const { page, pageSize } = tableState;

  const { data, isLoading } = useTerminalList({ page, limit: pageSize });
  const terminals = useMemo(() => data?.data ?? [], [data]);
  const total = data?.pagination?.total ?? terminals.length;
  const createTerminal = useCreateTerminal();
  const updateTerminal = useUpdateTerminal();
  const deleteTerminal = useDeleteTerminal();

  const activeCount = useMemo(() => terminals.filter((t) => t.isActive).length, [terminals]);
  const inactiveCount = useMemo(() => terminals.filter((t) => !t.isActive).length, [terminals]);
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  function openCreate() {
    setSelected(null);
    setModalOpen(true);
  }
  function openEdit(t: Terminal) {
    setSelected(t);
    setModalOpen(true);
  }
  function handleClose() {
    setModalOpen(false);
    setSelected(null);
  }

  async function handleSubmit(values: CreateTerminalDto | UpdateTerminalDto) {
    if (selected) {
      await updateTerminal.mutateAsync({ id: selected.id, data: values as UpdateTerminalDto });
    } else {
      await createTerminal.mutateAsync(values as CreateTerminalDto);
    }
    handleClose();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={PAGE_HEADER}>
        <div className="min-w-0">
          <h1 className={PAGE_TITLE}>Terminal</h1>
          <p className={PAGE_SUBTITLE}>{total} เครื่องในระบบ</p>
        </div>
        <button type="button" className={btn('primary')} onClick={openCreate}>
          <AppIcons.add />
          เพิ่ม Terminal
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>Terminal ทั้งหมด</div>
          <div className={cn(STAT_VALUE, 'text-primary')}>
            <span>{total}</span>
            <span className={STAT_SUFFIX}>เครื่อง</span>
          </div>
        </div>
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>เปิดใช้งาน</div>
          <div className={cn(STAT_VALUE, 'text-success-text')}>
            <span>{activeCount}</span>
            <span className={STAT_SUFFIX}>เครื่อง</span>
          </div>
        </div>
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>ปิดใช้งาน</div>
          <div className={cn(STAT_VALUE, 'text-foreground-lighter')}>
            <span>{inactiveCount}</span>
            <span className={STAT_SUFFIX}>เครื่อง</span>
          </div>
        </div>
      </div>

      <div className={TABLE_WRAP}>
        <table className={TABLE}>
          <thead>
            <tr>
              <th className={cn(TABLE_TH, 'w-38')}>Terminal Code</th>
              <th className={TABLE_TH}>ชื่อ Terminal</th>
              <th className={cn(TABLE_TH, 'w-33')}>บทบาท</th>
              <th className={cn(TABLE_TH, 'w-28')}>สถานะ</th>
              <th className={cn(TABLE_TH, 'w-33')}>สร้างเมื่อ</th>
              <th className={cn(TABLE_TH, 'w-14 text-right')}>
                <span className="sr-only">ตัวเลือก</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ?
              <tr>
                <td colSpan={6} className={TABLE_EMPTY}>
                  <AppIcons.loading spin className="mx-auto size-5 text-primary" />
                </td>
              </tr>
            : terminals.length === 0 ?
              <tr>
                <td colSpan={6} className={TABLE_EMPTY}>
                  ยังไม่มี Terminal — กด “เพิ่ม Terminal” เพื่อเริ่ม
                </td>
              </tr>
            : terminals.map((r) => (
                <tr key={r.id} className={TABLE_TR}>
                  <td className={TABLE_TD}>
                    <code className={CELL_CODE}>{r.terminalCode}</code>
                  </td>
                  <td className={TABLE_TD}>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-[11px] text-foreground-subtle">{r.id}</div>
                  </td>
                  <td className={TABLE_TD}>
                    <span className={dataPill(ROLE_COLOR[r.role])}>{r.role}</span>
                  </td>
                  <td className={TABLE_TD}>
                    <span className={DOT_BASE}>
                      <span className={cn(DOT, r.isActive ? DOT_TONE.success : DOT_TONE.default)} />
                      {r.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                  </td>
                  <td className={cn(TABLE_TD, 'font-mono text-xs tabular-nums')}>
                    {formatDate(r.createdAt, CREATED_AT_FORMAT)}
                  </td>
                  <td className={cn(TABLE_TD, 'text-right')}>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button
                          type="button"
                          aria-label="ตัวเลือกของแถวนี้"
                          className={btnIcon('ghost', 'sm')}
                        >
                          <AppIcons.more />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content align="end" sideOffset={4} className={MENU_CONTENT}>
                          <DropdownMenu.Item className={MENU_ITEM} onSelect={() => openEdit(r)}>
                            แก้ไข
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator className={MENU_SEPARATOR} />
                          <DropdownMenu.Item
                            className={MENU_ITEM_DANGER}
                            onSelect={(e) => {
                              // กัน Radix ปิดเมนูแล้วเปิดกล่องยืนยันในจังหวะเดียวกัน
                              e.preventDefault();
                              setPendingDelete(r);
                            }}
                          >
                            ลบ
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <div className={PAGER}>
        <span className={TEXT.subtle}>
          แสดง {terminals.length ? (page - 1) * pageSize + 1 : 0}–
          {(page - 1) * pageSize + terminals.length} จาก {total}
        </span>
        <div className="flex items-center gap-2">
          <label htmlFor="terminal-page-size" className="sr-only">
            จำนวนแถวต่อหน้า
          </label>
          <select
            id="terminal-page-size"
            value={pageSize}
            onChange={(e) =>
              setTableState({ ...tableState, page: 1, pageSize: Number(e.target.value) })
            }
            className={PAGE_SIZE_SELECT}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} / หน้า
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-label="หน้าก่อนหน้า"
            className={btnIcon('secondary', 'sm')}
            disabled={page <= 1}
            onClick={() => setTableState({ ...tableState, page: page - 1 })}
          >
            <AppIcons.arrowLeft />
          </button>
          <span className={cn(TEXT.subtle, 'tabular-nums')}>
            {page} / {lastPage}
          </span>
          <button
            type="button"
            aria-label="หน้าถัดไป"
            className={btnIcon('secondary', 'sm')}
            disabled={page >= lastPage}
            onClick={() => setTableState({ ...tableState, page: page + 1 })}
          >
            <AppIcons.arrowRight />
          </button>
        </div>
      </div>

      <AlertDialog.Root open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={DIALOG_OVERLAY} />
          <AlertDialog.Content className={cn(DIALOG_CONTENT, 'max-w-sm')}>
            <AlertDialog.Title className={DIALOG_TITLE}>ลบ Terminal นี้?</AlertDialog.Title>
            <AlertDialog.Description className={DIALOG_DESC}>
              “{pendingDelete?.name}” จะถูกลบออกจากระบบ
            </AlertDialog.Description>
            <div className={DIALOG_FOOTER}>
              <AlertDialog.Cancel asChild>
                <button type="button" className={btn()}>
                  ยกเลิก
                </button>
              </AlertDialog.Cancel>
              <button
                type="button"
                className={btn('danger')}
                disabled={deleteTerminal.isPending}
                onClick={() => {
                  if (pendingDelete) deleteTerminal.mutate(pendingDelete.id);
                  setPendingDelete(null);
                }}
              >
                {deleteTerminal.isPending && <AppIcons.loading spin />}
                ลบ
              </button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <TerminalFormModal
        open={modalOpen}
        terminal={selected}
        onClose={handleClose}
        onSubmit={handleSubmit}
        loading={createTerminal.isPending || updateTerminal.isPending}
      />
    </div>
  );
}
