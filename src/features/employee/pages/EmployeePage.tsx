import { useState } from 'react';
import { Popconfirm, Space, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Table, Button, Tag, PageHeader } from '@design-system';
import type { ColumnType } from '@design-system';
import { useEmployeeList, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from '../hooks';
import { EmployeeFormModal } from '../components/EmployeeFormModal';
import { DepartmentLabel, DepartmentColor } from '../types';
import type { Employee, CreateEmployeeDto } from '../types';

const { Search } = Input;

export function EmployeePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const params = { page, limit: pageSize, search: search || undefined };
  const { data, isLoading, refetch } = useEmployeeList(params);
  const employees = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  async function handleSubmit(values: CreateEmployeeDto) {
    if (selected) {
      await updateEmployee.mutateAsync({ id: selected.id, data: values });
    } else {
      await createEmployee.mutateAsync(values);
    }
    setModalOpen(false);
  }

  const columns: ColumnType<Employee>[] = [
    {
      title: 'ชื่อ-นามสกุล',
      key: 'fullName',
      render: (_: unknown, r: Employee) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.firstName} {r.lastName}</div>
          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>({r.nickname})</div>
        </div>
      ),
    },
    {
      title: 'เบอร์โทร',
      dataIndex: 'phoneNumber',
      width: 130,
      render: (v: string) => v ?? '-',
    },
    {
      title: 'แผนก',
      dataIndex: 'department',
      width: 130,
      render: (v: keyof typeof DepartmentLabel) => (
        <Tag color={DepartmentColor[v]}>{DepartmentLabel[v]}</Tag>
      ),
    },
    {
      title: 'วันที่เริ่มงาน',
      dataIndex: 'startDate',
      width: 130,
      render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '-',
    },
    {
      title: '',
      key: 'action',
      width: 100,
      render: (_: unknown, r: Employee) => (
        <Space>
          <Button
            variant="ghost" size="small" icon={<EditOutlined />}
            onClick={() => { setSelected(r); setModalOpen(true); }}
          />
          <Popconfirm
            title="ลบพนักงานนี้?"
            onConfirm={() => deleteEmployee.mutate(r.id)}
            okText="ลบ" cancelText="ยกเลิก" okButtonProps={{ danger: true }}
          >
            <Button variant="danger" size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
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
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>รีเฟรช</Button>
            <Button variant="primary" icon={<PlusOutlined />} onClick={() => { setSelected(null); setModalOpen(true); }}>
              เพิ่มพนักงาน
            </Button>
          </>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <Search
          prefix={<SearchOutlined />}
          placeholder="ค้นหาชื่อ, ชื่อเล่น..."
          allowClear
          style={{ width: 280 }}
          onSearch={(val) => { setSearch(val); setPage(1); }}
        />
      </div>

      <Table<Employee>
        rowKey="id"
        columns={columns}
        dataSource={employees}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
      />

      <EmployeeFormModal
        open={modalOpen}
        employee={selected}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
