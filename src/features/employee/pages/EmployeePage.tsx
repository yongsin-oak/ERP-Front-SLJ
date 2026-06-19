import { useMemo, useState } from 'react';
import { Flex, Space, Input, Typography, Badge } from 'antd';
import {
  Table, Button, Tag, PageHeader, BulkSelectionBar, colors, AppIcons,
  DeleteConfirmButton, Modal, InputPassword, SummaryCard, DateCell,
} from '@design-system';
import type { ColumnType } from '@design-system';
import { downloadFile, showError, useSearchState, notify } from '@shared';
import {
  useEmployeeList, useCreateEmployee, useUpdateEmployee, useDeleteEmployee,
  useBulkDeleteEmployee, useSetEmployeePin, employeeService,
} from '../react-query';
import { EmployeeFormModal } from '../components/EmployeeFormModal';
import { EmployeeImportModal } from '../components/EmployeeImportModal';
import { Departments, type Department } from '../types';
import type { Employee, CreateEmployeeDto } from '../types';

const { Search } = Input;

const EMPLOYEE_LIST_DEFAULTS = { search: '', page: 1, pageSize: 20 };

export function EmployeePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [tableState, setTableState] = useSearchState('employee-list', EMPLOYEE_LIST_DEFAULTS);
  const { search, page, pageSize } = tableState;
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [pinEmployee, setPinEmployee] = useState<Employee | null>(null);
  const [pinValue, setPinValue] = useState('');
  const [exporting, setExporting] = useState(false);

  const params = { page, limit: pageSize, search: search || undefined };
  const { data, isLoading, refetch } = useEmployeeList(params);
  const employees = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const bulkDelete = useBulkDeleteEmployee();
  const setPin = useSetEmployeePin();

  const activeCount = useMemo(() => employees.filter((e) => e.isActive).length, [employees]);
  const inactiveCount = useMemo(() => employees.filter((e) => !e.isActive).length, [employees]);

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
    await bulkDelete.mutateAsync(selectedKeys.map(String));
    setSelectedKeys([]);
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

  const columns: ColumnType<Employee>[] = [
    {
      title: 'ชื่อ-นามสกุล',
      key: 'fullName',
      render: (_: unknown, r: Employee) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.firstName} {r.lastName}</div>
          <div style={{ fontSize: 12, color: colors.text.tertiary }}>({r.nickname})</div>
        </div>
      ),
    },
    {
      title: 'เบอร์โทร',
      dataIndex: 'phoneNumber',
      width: 130,
      render: (v: string | null) => v ?? '-',
    },
    {
      title: 'แผนก',
      dataIndex: 'department',
      width: 130,
      render: (v: Department) => (
        <Tag color={Departments[v].color}>{Departments[v].label}</Tag>
      ),
    },
    {
      title: 'วันที่เริ่มงาน',
      dataIndex: 'startDate',
      width: 130,
      render: (v: string | null) => <DateCell value={v} format="DD/MM/YYYY" />,
    },
    {
      title: 'สถานะ',
      dataIndex: 'isActive',
      width: 100,
      render: (v: boolean) => (
        <Badge status={v ? 'success' : 'default'} text={v ? 'ใช้งาน' : 'ระงับ'} />
      ),
    },
    {
      title: '',
      key: 'action',
      width: 130,
      render: (_: unknown, r: Employee) => (
        <Space>
          <Button
            variant="ghost" size="small" icon={<AppIcons.key />}
            title="ตั้ง PIN"
            onClick={() => { setPinEmployee(r); setPinValue(''); }}
          />
          <Button
            variant="ghost" size="small" icon={<AppIcons.edit />}
            onClick={() => { setSelected(r); setModalOpen(true); }}
          />
          <DeleteConfirmButton
            onConfirm={() => deleteEmployee.mutate(r.id)}
            loading={deleteEmployee.isPending}
            title="ลบพนักงานนี้?"
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="พนักงาน"
        subtitle={`ทั้งหมด ${total} คน`}
        actions={
          <>
            <Button icon={<AppIcons.refresh />} onClick={() => refetch()}>รีเฟรช</Button>
            <Button icon={<AppIcons.exportFile size={16} />} onClick={handleExport} loading={exporting}>Export Excel</Button>
            <Button icon={<AppIcons.importFile size={16} />} onClick={() => setImportOpen(true)}>นำเข้า Excel</Button>
            <Button variant="primary" icon={<AppIcons.add />} onClick={() => { setSelected(null); setModalOpen(true); }}>
              เพิ่มพนักงาน
            </Button>
          </>
        }
      />

      <Flex gap={12} wrap style={{ marginBottom: 16 }}>
        <SummaryCard title="ทั้งหมด" value={total} suffix="คน" color={colors.brand.primary} style={{ flex: 1, minWidth: 140 }} />
        <SummaryCard title="ปฏิบัติงาน (หน้านี้)" value={activeCount} suffix="คน" color={colors.semantic.success} style={{ flex: 1, minWidth: 140 }} />
        <SummaryCard title="ระงับ (หน้านี้)" value={inactiveCount} suffix="คน" color={colors.text.secondary} style={{ flex: 1, minWidth: 140 }} />
      </Flex>

      <Flex gap={12} align="center" style={{ marginBottom: 12 }}>
        <Search
          prefix={<AppIcons.search />}
          placeholder="ค้นหาชื่อ, ชื่อเล่น..."
          allowClear
          style={{ width: 280 }}
          onSearch={(val) => setTableState({ ...tableState, search: val, page: 1 })}
        />
      </Flex>

      {selectedKeys.length > 0 && (
        <BulkSelectionBar
          count={selectedKeys.length}
          isDeleting={bulkDelete.isPending}
          onDelete={handleBulkDelete}
          onClear={() => setSelectedKeys([])}
        />
      )}

      <Table<Employee>
        rowKey="id"
        columns={columns}
        dataSource={employees}
        loading={isLoading}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: setSelectedKeys,
          preserveSelectedRowKeys: true,
        }}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => setTableState({ ...tableState, page: p, pageSize: ps }),
        }}
      />

      <EmployeeFormModal
        open={modalOpen}
        employee={selected}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={createEmployee.isPending || updateEmployee.isPending}
      />

      <EmployeeImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />

      <Modal
        open={!!pinEmployee}
        title={`ตั้ง PIN — ${pinEmployee?.firstName} (${pinEmployee?.nickname})`}
        onCancel={() => setPinEmployee(null)}
        onOk={handleSetPin}
        okText="บันทึก PIN"
        confirmLoading={setPin.isPending}
        okButtonProps={{ disabled: pinValue.length < 4 }}
      >
        <div style={{ padding: '16px 0' }}>
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
            PIN ต้องเป็นตัวเลข 4–6 หลัก
          </Typography.Text>
          <InputPassword
            value={pinValue}
            onChange={(e) => setPinValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="กรอก PIN 4-6 หลัก"
            maxLength={6}
            style={{ width: '100%', letterSpacing: 6, fontSize: 20, textAlign: 'center' }}
          />
          <Typography.Text
            type={pinValue.length >= 4 && pinValue.length <= 6 ? 'success' : 'secondary'}
            style={{ fontSize: 12, marginTop: 4, display: 'block' }}
          >
            {pinValue.length} หลัก {pinValue.length >= 4 && pinValue.length <= 6 ? '✓' : '(ต้องการ 4-6 หลัก)'}
          </Typography.Text>
        </div>
      </Modal>
    </div>
  );
}
