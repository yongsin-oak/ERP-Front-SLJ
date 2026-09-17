import { useMemo, useState } from 'react';
import { AlertDialog, Checkbox, Dialog, DropdownMenu } from 'radix-ui';
import { downloadFile, showError, useSearchState, notify } from '@shared';
import { AppIcons } from '@/lib/icons';
import { formatDate, DATE_FORMAT } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  btn,
  btnIcon,
  BULK_BAR,
  CHECKBOX,
  dataPill,
  DIALOG_CLOSE_X,
  DIALOG_CONTENT,
  DIALOG_DESC,
  DIALOG_FOOTER,
  DIALOG_OVERLAY,
  DIALOG_TITLE,
  DOT,
  DOT_BASE,
  DOT_TONE,
  INPUT,
  MENU_CONTENT,
  MENU_ITEM,
  MENU_ITEM_DANGER,
  MENU_SEPARATOR,
  PAGE_HEADER,
  PAGE_SIZE_SELECT,
  PAGE_SUBTITLE,
  PAGE_TITLE,
  PAGER,
  SEARCH_CLEAR,
  SEARCH_ICON,
  SEARCH_INPUT,
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
  useEmployeeList, useCreateEmployee, useUpdateEmployee, useDeleteEmployee,
  useBulkDeleteEmployee, useSetEmployeePin, employeeService,
} from '../react-query';
import { EmployeeFormModal } from '../components/EmployeeFormModal';
import { EmployeeImportModal } from '../components/EmployeeImportModal';
import { Departments } from '../types';
import type { Employee, CreateEmployeeDto } from '../types';

const EMPLOYEE_LIST_DEFAULTS = { search: '', page: 1, pageSize: 20 };
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const PIN_LENGTH = 4;

export function EmployeePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [tableState, setTableState] = useSearchState('employee-list', EMPLOYEE_LIST_DEFAULTS);
  const { search, page, pageSize } = tableState;
  const [searchInput, setSearchInput] = useState(search);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [pinEmployee, setPinEmployee] = useState<Employee | null>(null);
  const [pinValue, setPinValue] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Employee | null>(null);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

  const params = { page, limit: pageSize, search: search || undefined };
  const { data, isLoading, refetch } = useEmployeeList(params);
  const employees = useMemo(() => data?.data ?? [], [data]);
  const total = data?.pagination?.total ?? 0;

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const bulkDelete = useBulkDeleteEmployee();
  const setPin = useSetEmployeePin();

  const activeCount = useMemo(() => employees.filter((e) => e.isActive).length, [employees]);
  const inactiveCount = useMemo(() => employees.filter((e) => !e.isActive).length, [employees]);

  const allSelected = employees.length > 0 && employees.every((r) => selectedKeys.includes(r.id));
  const someSelected = selectedKeys.length > 0 && !allSelected;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  async function handleExport() {
    setExporting(true);
    const key = notify.loading('กำลังส่งออก Excel พนักงาน...');
    try {
      const res = await employeeService.exportXlsx({ search: search || undefined });
      downloadFile(res.data as unknown as Blob, 'พนักงาน.xlsx');
      notify.resolve(key, 'success', 'ส่งออก Excel พนักงาน สำเร็จ');
    } catch (err) {
      notify.dismiss(key);
      showError(err, 'ส่งออก Excel พนักงาน');
    } finally {
      setExporting(false);
    }
  }

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(selectedKeys);
    setSelectedKeys([]);
    setBulkConfirmOpen(false);
  }

  async function handleSubmit(values: CreateEmployeeDto) {
    if (selected) {
      await updateEmployee.mutateAsync({ id: selected.id, data: values });
    } else {
      await createEmployee.mutateAsync(values);
    }
    setModalOpen(false);
  }

  async function handleSetPin() {
    if (!pinEmployee) return;
    await setPin.mutateAsync({ id: pinEmployee.id, pin: pinValue });
    setPinEmployee(null);
    setPinValue('');
  }

  function toggleAll(checked: boolean) {
    const pageIds = employees.map((r) => r.id);
    setSelectedKeys((keys) =>
      checked ? [...new Set([...keys, ...pageIds])] : keys.filter((k) => !pageIds.includes(k)),
    );
  }

  return (
    <div>
      <div className={`${PAGE_HEADER} mb-4`}>
        <div className="min-w-0">
          <h1 className={PAGE_TITLE}>พนักงาน</h1>
          <p className={PAGE_SUBTITLE}>ทั้งหมด {total} คน</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn()} onClick={() => refetch()}>
            <AppIcons.refresh />
            รีเฟรช
          </button>
          <button type="button" className={btn()} onClick={handleExport} disabled={exporting}>
            {exporting ? <AppIcons.loading spin /> : <AppIcons.exportFile />}
            Export Excel
          </button>
          <button type="button" className={btn()} onClick={() => setImportOpen(true)}>
            <AppIcons.importFile />
            นำเข้า Excel
          </button>
          <button
            type="button"
            className={btn('primary')}
            onClick={() => {
              setSelected(null);
              setModalOpen(true);
            }}
          >
            <AppIcons.add />
            เพิ่มพนักงาน
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>ทั้งหมด</div>
          <div className={cn(STAT_VALUE, 'text-primary')}>
            <span>{total}</span>
            <span className={STAT_SUFFIX}>คน</span>
          </div>
        </div>
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>ปฏิบัติงาน (หน้านี้)</div>
          <div className={cn(STAT_VALUE, 'text-success-text')}>
            <span>{activeCount}</span>
            <span className={STAT_SUFFIX}>คน</span>
          </div>
        </div>
        <div className={STAT_CARD}>
          <div className={STAT_LABEL}>ระงับ (หน้านี้)</div>
          <div className={cn(STAT_VALUE, 'text-foreground-lighter')}>
            <span>{inactiveCount}</span>
            <span className={STAT_SUFFIX}>คน</span>
          </div>
        </div>
      </div>

      <div className="relative mb-3 w-full sm:w-70">
        <AppIcons.search className={SEARCH_ICON} />
        <input
          className={SEARCH_INPUT}
          placeholder="ค้นหาชื่อ, ชื่อเล่น..."
          aria-label="ค้นหาพนักงาน"
          value={searchInput}
          onChange={(e) => {
            const val = e.target.value;
            setSearchInput(val);
            if (val === '') setTableState({ ...tableState, search: '', page: 1 });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setTableState({ ...tableState, search: searchInput, page: 1 });
          }}
        />
        {searchInput && (
          <button
            type="button"
            aria-label="ล้างคำค้น"
            className={SEARCH_CLEAR}
            onClick={() => {
              setSearchInput('');
              setTableState({ ...tableState, search: '', page: 1 });
            }}
          >
            <AppIcons.close className="size-3.5" />
          </button>
        )}
      </div>

      {selectedKeys.length > 0 && (
        <div className={`${BULK_BAR} mb-3 justify-between`}>
          <span className={TEXT.muted}>เลือก {selectedKeys.length} รายการ</span>
          <div className="flex gap-2">
            <button
              type="button"
              className={btn('danger', 'sm')}
              onClick={() => setBulkConfirmOpen(true)}
              disabled={bulkDelete.isPending}
            >
              {bulkDelete.isPending ? <AppIcons.loading spin /> : <AppIcons.delete />}
              ลบที่เลือก
            </button>
            <button
              type="button"
              className={btn('ghost', 'sm')}
              onClick={() => setSelectedKeys([])}
              disabled={bulkDelete.isPending}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      <div className={TABLE_WRAP}>
        <table className={TABLE}>
          <thead>
            <tr>
              <th className={cn(TABLE_TH, 'w-10')}>
                <Checkbox.Root
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onCheckedChange={(c) => toggleAll(c === true)}
                  aria-label="เลือกทุกแถวในหน้านี้"
                  className={CHECKBOX}
                >
                  <Checkbox.Indicator className="flex items-center justify-center">
                    {someSelected ?
                      <AppIcons.minus className="size-3" />
                    : <AppIcons.check className="size-3" />}
                  </Checkbox.Indicator>
                </Checkbox.Root>
              </th>
              <th className={TABLE_TH}>ชื่อ-นามสกุล</th>
              <th className={cn(TABLE_TH, 'w-33')}>เบอร์โทร</th>
              <th className={cn(TABLE_TH, 'w-33')}>แผนก</th>
              <th className={cn(TABLE_TH, 'w-33')}>วันที่เริ่มงาน</th>
              <th className={cn(TABLE_TH, 'w-25')}>สถานะ</th>
              <th className={cn(TABLE_TH, 'w-14 text-center')}>
                <span className="sr-only">ตัวเลือก</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ?
              <tr>
                <td colSpan={7} className={TABLE_EMPTY}>
                  <AppIcons.loading spin className="mx-auto size-5 text-primary" />
                </td>
              </tr>
            : employees.length === 0 ?
              <tr>
                <td colSpan={7} className={TABLE_EMPTY}>
                  {search ?
                    `ไม่พบพนักงานที่ตรงกับ “${search}”`
                  : 'ยังไม่มีพนักงาน — กด “เพิ่มพนักงาน” เพื่อเริ่ม'}
                </td>
              </tr>
            : employees.map((r) => {
                const checked = selectedKeys.includes(r.id);
                const dept = Departments[r.department];
                return (
                  <tr key={r.id} data-selected={checked} className={TABLE_TR}>
                    <td className={TABLE_TD}>
                      <Checkbox.Root
                        checked={checked}
                        onCheckedChange={(c) =>
                          setSelectedKeys((keys) =>
                            c === true ? [...keys, r.id] : keys.filter((k) => k !== r.id),
                          )
                        }
                        aria-label={`เลือก ${r.firstName} ${r.lastName}`}
                        className={CHECKBOX}
                      >
                        <Checkbox.Indicator className="flex items-center justify-center">
                          <AppIcons.check className="size-3" />
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                    </td>
                    <td className={TABLE_TD}>
                      <div className="font-medium">
                        {r.firstName} {r.lastName}
                      </div>
                      <div className="text-xs text-foreground-subtle">({r.nickname})</div>
                    </td>
                    <td className={cn(TABLE_TD, 'font-mono text-xs tabular-nums')}>
                      {r.phoneNumber ?? '-'}
                    </td>
                    <td className={TABLE_TD}>
                      <span className={dataPill(dept.color)}>{dept.label}</span>
                    </td>
                    <td className={cn(TABLE_TD, 'font-mono text-xs tabular-nums')}>
                      {formatDate(r.startDate, DATE_FORMAT.date)}
                    </td>
                    <td className={TABLE_TD}>
                      <span className={DOT_BASE}>
                        <span className={cn(DOT, r.isActive ? DOT_TONE.success : DOT_TONE.default)} />
                        {r.isActive ? 'ใช้งาน' : 'ระงับ'}
                      </span>
                    </td>
                    <td className={cn(TABLE_TD, 'text-center')}>
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
                              onSelect={() => {
                                setPinEmployee(r);
                                setPinValue('');
                                setShowPin(false);
                              }}
                            >
                              ตั้ง PIN
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              className={MENU_ITEM}
                              onSelect={() => {
                                setSelected(r);
                                setModalOpen(true);
                              }}
                            >
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
                );
              })
            }
          </tbody>
        </table>
      </div>

      <div className={PAGER}>
        <span className={TEXT.subtle}>
          แสดง {employees.length ? (page - 1) * pageSize + 1 : 0}–
          {(page - 1) * pageSize + employees.length} จาก {total}
        </span>
        <div className="flex items-center gap-2">
          <label htmlFor="employee-page-size" className="sr-only">
            จำนวนแถวต่อหน้า
          </label>
          <select
            id="employee-page-size"
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

      <EmployeeFormModal
        open={modalOpen}
        employee={selected}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={createEmployee.isPending || updateEmployee.isPending}
      />

      <EmployeeImportModal open={importOpen} onClose={() => setImportOpen(false)} />

      {/* ตั้ง PIN */}
      <Dialog.Root open={!!pinEmployee} onOpenChange={(o) => !o && setPinEmployee(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className={DIALOG_OVERLAY} />
          <Dialog.Content className={DIALOG_CONTENT} aria-describedby={undefined}>
            <Dialog.Title className={DIALOG_TITLE}>
              ตั้ง PIN — {pinEmployee?.firstName} ({pinEmployee?.nickname})
            </Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" aria-label="ปิด" className={DIALOG_CLOSE_X}>
                <AppIcons.close />
              </button>
            </Dialog.Close>

            <div className="flex flex-col gap-2">
              <label htmlFor="employee-pin" className={TEXT.muted}>
                PIN ต้องเป็นตัวเลข {PIN_LENGTH} หลัก
              </label>
              <div className="relative">
                <input
                  id="employee-pin"
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={PIN_LENGTH}
                  value={pinValue}
                  onChange={(e) =>
                    setPinValue(e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH))
                  }
                  placeholder={`กรอก PIN ${PIN_LENGTH} หลัก`}
                  className={cn(INPUT, 'pr-10 text-center text-xl tracking-[0.4em]')}
                />
                <button
                  type="button"
                  aria-label={showPin ? 'ซ่อน PIN' : 'แสดง PIN'}
                  onClick={() => setShowPin((s) => !s)}
                  className={cn(btnIcon('ghost', 'sm'), 'absolute top-1/2 right-0.5 -translate-y-1/2')}
                >
                  <AppIcons.view />
                </button>
              </div>
              <span
                className={cn(
                  'text-xs',
                  pinValue.length === PIN_LENGTH ? 'text-success-text' : 'text-foreground-muted',
                )}
              >
                {pinValue.length} หลัก{' '}
                {pinValue.length === PIN_LENGTH ? '✓' : `(ต้องการ ${PIN_LENGTH} หลัก)`}
              </span>
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
                disabled={pinValue.length !== PIN_LENGTH || setPin.isPending}
                onClick={() => void handleSetPin()}
              >
                {setPin.isPending && <AppIcons.loading spin />}
                บันทึก PIN
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog.Root open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={DIALOG_OVERLAY} />
          <AlertDialog.Content className={cn(DIALOG_CONTENT, 'max-w-sm')}>
            <AlertDialog.Title className={DIALOG_TITLE}>ลบพนักงานนี้?</AlertDialog.Title>
            <AlertDialog.Description className={DIALOG_DESC}>
              ไม่สามารถยกเลิกการดำเนินการนี้ได้
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
                disabled={deleteEmployee.isPending}
                onClick={() => {
                  if (pendingDelete) deleteEmployee.mutate(pendingDelete.id);
                  setPendingDelete(null);
                }}
              >
                {deleteEmployee.isPending && <AppIcons.loading spin />}
                ลบ
              </button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <AlertDialog.Root open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={DIALOG_OVERLAY} />
          <AlertDialog.Content className={cn(DIALOG_CONTENT, 'max-w-sm')}>
            <AlertDialog.Title className={DIALOG_TITLE}>
              ลบ {selectedKeys.length} รายการที่เลือก?
            </AlertDialog.Title>
            <AlertDialog.Description className={DIALOG_DESC}>
              ไม่สามารถยกเลิกการดำเนินการนี้ได้
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
                disabled={bulkDelete.isPending}
                onClick={() => void handleBulkDelete()}
              >
                {bulkDelete.isPending && <AppIcons.loading spin />}
                ลบที่เลือก
              </button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
