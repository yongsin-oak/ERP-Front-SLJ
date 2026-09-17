import { useMemo, useState } from 'react';
import { AlertDialog, Dialog, DropdownMenu, Select } from 'radix-ui';
import type { Role } from '@features/auth/types';
import { useSearchState, PAGINATION } from '@shared';
import { ROLE_COLOR } from '@config/access';
import { AppIcons } from '@/lib/icons';
import { cn } from '@/lib/utils';
import {
  btn,
  btnIcon,
  CELL_CODE,
  dataPill,
  DIALOG_CLOSE_X,
  DIALOG_CONTENT,
  DIALOG_DESC,
  DIALOG_FOOTER,
  DIALOG_OVERLAY,
  DIALOG_TITLE,
  FIELD_ERROR,
  FIELD_ROW,
  LABEL,
  MENU_CONTENT,
  MENU_ITEM,
  MENU_ITEM_DANGER,
  MENU_SEPARATOR,
  PAGE_HEADER,
  PAGE_SIZE_SELECT,
  PAGE_SUBTITLE,
  PAGE_TITLE,
  PAGER,
  SELECT_CONTENT,
  SELECT_ITEM,
  SELECT_TRIGGER,
  SELECT_VIEWPORT,
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
import { useUserList, useRoles, useCreateUser, useUpdateUserRole, useDeleteUser } from '../react-query';
import { UserFormModal } from '../components/UserFormModal';
import type { User } from '../types';

const ADMIN_ROLES: Role[] = ['SuperAdmin', 'Admin'];

// annotate เป็น number ตรงๆ — PAGINATION เป็น `as const` ค่าเลยเป็น literal type
const LIST_DEFAULTS: { page: number; pageSize: number } = {
  page: PAGINATION.DEFAULT_PAGE,
  pageSize: PAGINATION.DEFAULT_LIMIT,
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function UserPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<Role | undefined>();
  const [editError, setEditError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<User | null>(null);

  // แบ่งหน้าฝั่ง server — ไม่ดึงผู้ใช้ทั้งหมดมาไว้ในหน่วยความจำ
  const [tableState, setTableState] = useSearchState('user-list', LIST_DEFAULTS);
  const { page, pageSize } = tableState;

  const { data, isLoading } = useUserList({ page, limit: pageSize });
  const users = useMemo(() => data?.data ?? [], [data]);
  const total = data?.pagination?.total ?? users.length;
  const { data: roles = [] } = useRoles();
  const createUser = useCreateUser();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  const adminCount = useMemo(() => users.filter((u) => ADMIN_ROLES.includes(u.role)).length, [users]);
  const operatorCount = useMemo(
    () => users.filter((u) => !ADMIN_ROLES.includes(u.role)).length,
    [users],
  );
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  /**
   * เปิดกล่องแก้ไขบทบาท พร้อมเติมบทบาทปัจจุบันลงไปในจังหวะเดียวกัน
   * ตั้งค่าตรงนี้ (ตอนกด) ไม่ใช่ใน effect — ไม่งั้นกดแก้ไขคนที่สองจะเห็นบทบาทของคนแรกค้างหนึ่งเฟรม
   */
  function openEditRole(user: User) {
    setEditTarget(user);
    setEditRole(user.role);
    setEditError('');
  }

  async function handleUpdateRole() {
    if (!editTarget) return;
    if (!editRole) {
      setEditError('กรุณาเลือกบทบาท');
      return;
    }
    await updateRole.mutateAsync({ id: editTarget.id, role: editRole });
    setEditTarget(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={PAGE_HEADER}>
        <div className="min-w-0">
          <h1 className={PAGE_TITLE}>ผู้ใช้งาน</h1>
          <p className={PAGE_SUBTITLE}>{total} บัญชีในระบบ</p>
        </div>
        <button type="button" className={btn('primary')} onClick={() => setCreateOpen(true)}>
          <AppIcons.add />
          เพิ่มผู้ใช้งาน
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>ทั้งหมด</div>
          <div className={cn(STAT_VALUE, 'text-primary')}>
            <span>{total}</span>
            <span className={STAT_SUFFIX}>บัญชี</span>
          </div>
        </div>
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>Admin</div>
          <div className={cn(STAT_VALUE, 'text-destructive')}>
            <span>{adminCount}</span>
            <span className={STAT_SUFFIX}>บัญชี</span>
          </div>
        </div>
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>ปฏิบัติงาน</div>
          <div className={cn(STAT_VALUE, 'text-success-text')}>
            <span>{operatorCount}</span>
            <span className={STAT_SUFFIX}>บัญชี</span>
          </div>
        </div>
      </div>

      <div className={TABLE_WRAP}>
        <table className={TABLE}>
          <thead>
            <tr>
              <th className={TABLE_TH}>Username</th>
              <th className={cn(TABLE_TH, 'w-36')}>บทบาท</th>
              <th className={cn(TABLE_TH, 'w-40')}>ID</th>
              <th className={cn(TABLE_TH, 'w-14 text-right')}>
                <span className="sr-only">ตัวเลือก</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ?
              <tr>
                <td colSpan={4} className={TABLE_EMPTY}>
                  <AppIcons.loading spin className="mx-auto size-5 text-primary" />
                </td>
              </tr>
            : users.length === 0 ?
              <tr>
                <td colSpan={4} className={TABLE_EMPTY}>
                  ยังไม่มีผู้ใช้งาน — กด “เพิ่มผู้ใช้งาน” เพื่อเริ่ม
                </td>
              </tr>
            : users.map((r) => (
                <tr key={r.id} className={TABLE_TR}>
                  <td className={TABLE_TD}>
                    <span className="flex items-center gap-2">
                      <AppIcons.user className="text-foreground-subtle" />
                      <span className="font-medium">{r.username}</span>
                    </span>
                  </td>
                  <td className={TABLE_TD}>
                    <span className={dataPill(ROLE_COLOR[r.role])}>{r.role}</span>
                  </td>
                  <td className={TABLE_TD}>
                    <code className={CELL_CODE}>{r.id}</code>
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
                          <DropdownMenu.Item
                            className={MENU_ITEM}
                            onSelect={() => openEditRole(r)}
                          >
                            เปลี่ยนบทบาท
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
          แสดง {users.length ? (page - 1) * pageSize + 1 : 0}–{(page - 1) * pageSize + users.length}{' '}
          จาก {total}
        </span>
        <div className="flex items-center gap-2">
          <label htmlFor="user-page-size" className="sr-only">
            จำนวนแถวต่อหน้า
          </label>
          <select
            id="user-page-size"
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

      <UserFormModal
        open={createOpen}
        roles={roles}
        onClose={() => setCreateOpen(false)}
        onSubmit={async (values) => {
          await createUser.mutateAsync(values);
          setCreateOpen(false);
        }}
        loading={createUser.isPending}
      />

      {/* เปลี่ยนบทบาท */}
      <Dialog.Root open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className={DIALOG_OVERLAY} />
          <Dialog.Content className={cn(DIALOG_CONTENT, 'max-w-sm')} aria-describedby={undefined}>
            <Dialog.Title className={DIALOG_TITLE}>
              เปลี่ยนบทบาท — {editTarget?.username ?? ''}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" aria-label="ปิด" className={DIALOG_CLOSE_X}>
                <AppIcons.close />
              </button>
            </Dialog.Close>

            <div className={FIELD_ROW}>
              <label htmlFor="user-edit-role" className={LABEL}>
                บทบาทใหม่
              </label>
              <Select.Root
                value={editRole}
                onValueChange={(v) => {
                  setEditRole(v as Role);
                  setEditError('');
                }}
              >
                <Select.Trigger
                  id="user-edit-role"
                  aria-invalid={!!editError}
                  className={SELECT_TRIGGER}
                >
                  <Select.Value placeholder="เลือกบทบาท" />
                  <Select.Icon>
                    <AppIcons.chevronDown />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content position="popper" sideOffset={4} className={SELECT_CONTENT}>
                    <Select.Viewport className={SELECT_VIEWPORT}>
                      {roles.map((r) => (
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
              {editError && <span className={FIELD_ERROR}>{editError}</span>}
            </div>

            <div className={DIALOG_FOOTER}>
              <Dialog.Close asChild>
                <button type="button" className={btn()}>
                  ยกเลิก
                </button>
              </Dialog.Close>
              <button
                type="button"
                className={btn('primary')}
                disabled={updateRole.isPending}
                onClick={() => void handleUpdateRole()}
              >
                {updateRole.isPending && <AppIcons.loading spin />}
                บันทึก
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog.Root open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={DIALOG_OVERLAY} />
          <AlertDialog.Content className={cn(DIALOG_CONTENT, 'max-w-sm')}>
            <AlertDialog.Title className={DIALOG_TITLE}>ลบผู้ใช้งานนี้?</AlertDialog.Title>
            <AlertDialog.Description className={DIALOG_DESC}>
              “{pendingDelete?.username}” จะถูกลบออกจากระบบถาวร
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
                disabled={deleteUser.isPending}
                onClick={() => {
                  if (pendingDelete) deleteUser.mutate(pendingDelete.id);
                  setPendingDelete(null);
                }}
              >
                {deleteUser.isPending && <AppIcons.loading spin />}
                ลบ
              </button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
