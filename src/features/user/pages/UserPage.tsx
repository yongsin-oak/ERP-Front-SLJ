import { useState } from 'react';
import { Tag, Popconfirm, Space, Tooltip, Form } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { Table, Button, PageHeader, Select, Modal } from '@design-system';
import type { ColumnType } from '@design-system';
import type { Role } from '@features/auth/types';
import { useUsers, useRoles, useCreateUser, useUpdateUserRole, useDeleteUser } from '../hooks';
import { UserFormModal } from '../components/UserFormModal';
import type { User } from '../types';

const ROLE_COLOR: Record<Role, string> = {
  SuperAdmin: 'red', Admin: 'orange', Operator: 'blue', Warehouse: 'cyan',
  Accountant: 'green', HR: 'purple', Marketing: 'magenta', Sales: 'gold',
};

export function UserPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editForm] = Form.useForm<{ role: Role }>();

  const { data: users = [], isLoading } = useUsers();
  const { data: roles = [] } = useRoles();
  const createUser = useCreateUser();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  function openEdit(u: User) {
    setEditTarget(u);
    editForm.setFieldsValue({ role: u.role });
  }

  async function handleEditRole() {
    if (!editTarget) return;
    const { role } = await editForm.validateFields();
    await updateRole.mutateAsync({ id: editTarget.id, role });
    setEditTarget(null);
  }

  const columns: ColumnType<User>[] = [
    {
      title: 'Username',
      dataIndex: 'username',
      render: (v: string) => (
        <Space>
          <UserOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />
          <span style={{ fontWeight: 500 }}>{v}</span>
        </Space>
      ),
    },
    {
      title: 'บทบาท',
      dataIndex: 'role',
      width: 140,
      render: (v: Role) => <Tag color={ROLE_COLOR[v]}>{v}</Tag>,
    },
    {
      title: 'ID',
      dataIndex: 'id',
      width: 160,
      render: (v: string) => (
        <code style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>{v}</code>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      align: 'right' as const,
      render: (_: unknown, r: User) => (
        <Space size={4}>
          <Tooltip title="เปลี่ยนบทบาท">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          </Tooltip>
          <Popconfirm
            title="ลบผู้ใช้งานนี้?"
            description={`"${r.username}" จะถูกลบออกจากระบบถาวร`}
            okText="ลบ"
            okButtonProps={{ danger: true }}
            cancelText="ยกเลิก"
            onConfirm={() => deleteUser.mutate(r.id)}
          >
            <Tooltip title="ลบ">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        title="ผู้ใช้งาน"
        subtitle={`${users.length} บัญชีในระบบ`}
        actions={
          <Button variant="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            เพิ่มผู้ใช้งาน
          </Button>
        }
      />

      <Table<User>
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={isLoading}
        pagination={false}
        size="middle"
      />

      {/* create modal */}
      <UserFormModal
        open={createOpen}
        roles={roles}
        onClose={() => setCreateOpen(false)}
        onSubmit={async (values) => { await createUser.mutateAsync(values); }}
      />

      {/* edit role modal */}
      <Modal
        open={!!editTarget}
        title={
          <Space>
            <EditOutlined />
            เปลี่ยนบทบาท — {editTarget?.username}
          </Space>
        }
        onCancel={() => setEditTarget(null)}
        width={360}
        destroyOnHidden
        footer={[
          <Button key="cancel" onClick={() => setEditTarget(null)}>ยกเลิก</Button>,
          <Button
            key="save"
            variant="primary"
            loading={updateRole.isPending}
            onClick={handleEditRole}
          >
            บันทึก
          </Button>,
        ]}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="role" label="บทบาทใหม่" rules={[{ required: true }]}>
            <Select
              options={roles.map((r) => ({
                label: <Tag color={ROLE_COLOR[r]} style={{ margin: 0 }}>{r}</Tag>,
                value: r,
              }))}
              placeholder="เลือกบทบาท"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
