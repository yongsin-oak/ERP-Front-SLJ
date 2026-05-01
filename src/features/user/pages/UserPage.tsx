import { useState } from 'react';
import { Popconfirm, Space, Tag, Modal as AntModal } from 'antd';
import {
  PlusOutlined, DeleteOutlined, ReloadOutlined, CrownOutlined,
} from '@ant-design/icons';
import { Table, Button, PageHeader, Select } from '@design-system';
import type { ColumnType } from '@design-system';
import { useAuth } from '@features/auth/hooks';
import { UserFormModal } from '../components/UserFormModal';
import {
  useUsers, useRoles, useCreateUser, useUpdateUserRole, useDeleteUser,
} from '../hooks';
import type { User, CreateUserDto } from '../types';
import type { Role } from '@features/auth/types';

const ROLE_COLORS: Record<Role, string> = {
  SuperAdmin: 'red',
  Admin: 'volcano',
  Operator: 'blue',
  Warehouse: 'cyan',
  Accountant: 'gold',
  HR: 'magenta',
  Marketing: 'purple',
  Sales: 'green',
};

export function UserPage() {
  const me = useAuth((s) => s.user);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: users = [], isLoading, refetch, isFetching } = useUsers();
  const { data: roles = [] } = useRoles();
  const createUser = useCreateUser();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  async function handleSubmit(values: CreateUserDto) {
    await createUser.mutateAsync(values);
  }

  function handleRoleChange(user: User, newRole: Role) {
    if (user.role === newRole) return;
    AntModal.confirm({
      title: `เปลี่ยนบทบาทของ ${user.username}?`,
      content: `จาก ${user.role} → ${newRole}`,
      okText: 'ยืนยัน', cancelText: 'ยกเลิก',
      onOk: () => updateRole.mutateAsync({ id: user.id, role: newRole }),
    });
  }

  const roleOptions = roles.map((r) => ({
    label: <Tag color={ROLE_COLORS[r]} style={{ margin: 0 }}>{r}</Tag>,
    value: r,
  }));

  const roleFilters = roles.map((r) => ({ text: r, value: r }));

  const columns: ColumnType<User>[] = [
    {
      title: 'รหัสผู้ใช้',
      dataIndex: 'id',
      width: 180,
      searchable: true,
      render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code>,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
      searchable: true,
      defaultSortOrder: 'ascend',
      render: (v: string, r: User) => (
        <Space size={6}>
          {r.role === 'SuperAdmin' && <CrownOutlined style={{ color: '#fa541c' }} />}
          <strong>{v}</strong>
          {me?.username === v && <Tag color="blue" style={{ fontSize: 10 }}>คุณ</Tag>}
        </Space>
      ),
    },
    {
      title: 'บทบาท',
      dataIndex: 'role',
      width: 200,
      filters: roleFilters,
      onFilter: (value, r) => r.role === value,
      sorter: (a, b) => a.role.localeCompare(b.role),
      render: (v: Role, r: User) => {
        // ห้ามแก้ role ของตัวเอง
        const isMe = me?.username === r.username;
        if (isMe) return <Tag color={ROLE_COLORS[v]}>{v}</Tag>;
        return (
          <Select
            value={v}
            options={roleOptions}
            style={{ width: 160 }}
            size="small"
            onChange={(val) => handleRoleChange(r, val as Role)}
          />
        );
      },
    },
    {
      title: '',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_: unknown, r: User) => {
        const isMe = me?.username === r.username;
        return (
          <Popconfirm
            title="ลบผู้ใช้งานนี้?"
            description="ผู้ใช้จะไม่สามารถเข้าระบบได้อีก"
            disabled={isMe}
            onConfirm={() => deleteUser.mutate(r.id)}
            okText="ลบ" cancelText="ยกเลิก" okButtonProps={{ danger: true }}
          >
            <Button
              variant="danger-ghost" size="small" icon={<DeleteOutlined />}
              disabled={isMe}
              title={isMe ? 'ลบบัญชีของตัวเองไม่ได้' : 'ลบ'}
            />
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="ผู้ใช้งาน & บทบาท"
        subtitle={`ทั้งหมด ${users.length} คน`}
        actions={
          <>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
              รีเฟรช
            </Button>
            <Button variant="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
              เพิ่มผู้ใช้งาน
            </Button>
          </>
        }
      />

      <Table<User>
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={isLoading}
      />

      <UserFormModal
        open={modalOpen}
        roles={roles}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
