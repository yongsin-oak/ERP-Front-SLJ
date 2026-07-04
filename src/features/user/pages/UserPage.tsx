import { useMemo, useState } from 'react';
import {
  Table, Button, PageHeader, Select, FormModal, Form, Tag, colors,
  ActionCell, CodeCell, SummaryCard, AppIcons, Inline, Stack,
} from '@design-system';
import type { ColumnType } from '@design-system';
import type { Role } from '@features/auth/types';
import { useUsers, useRoles, useCreateUser, useUpdateUserRole, useDeleteUser } from '../react-query';
import { UserFormModal } from '../components/UserFormModal';
import type { User } from '../types';

const ROLE_COLOR: Record<Role, string> = {
  SuperAdmin: 'red', Admin: 'orange', Operator: 'blue', Warehouse: 'cyan',
  Accountant: 'green', HR: 'purple', Marketing: 'magenta', Sales: 'gold',
};

const ADMIN_ROLES: Role[] = ['SuperAdmin', 'Admin'];

export function UserPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editForm] = Form.useForm<{ role: Role }>();

  const { data: users = [], isLoading } = useUsers();
  const { data: roles = [] } = useRoles();
  const createUser = useCreateUser();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  const adminCount = useMemo(() => users.filter((u) => ADMIN_ROLES.includes(u.role)).length, [users]);
  const operatorCount = useMemo(() => users.filter((u) => !ADMIN_ROLES.includes(u.role)).length, [users]);

  function openEdit(u: User) {
    setEditTarget(u);
    editForm.setFieldsValue({ role: u.role });
  }

  const columns: ColumnType<User>[] = [
    {
      title: 'Username',
      dataIndex: 'username',
      render: (v: string) => (
        <Inline>
          <AppIcons.user style={{ color: colors.text.tertiary }} />
          <span style={{ fontWeight: 500 }}>{v}</span>
        </Inline>
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
      render: (v: string) => <CodeCell>{v}</CodeCell>,
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      align: 'right' as const,
      render: (_: unknown, r: User) => (
        <ActionCell
          onEdit={() => openEdit(r)}
          onDelete={() => deleteUser.mutate(r.id)}
          isDeleting={deleteUser.isPending}
          deleteTitle="ลบผู้ใช้งานนี้?"
          deleteDescription={`"${r.username}" จะถูกลบออกจากระบบถาวร`}
        />
      ),
    },
  ];

  return (
    <Stack gap={4}>
      <PageHeader
        title="ผู้ใช้งาน"
        subtitle={`${users.length} บัญชีในระบบ`}
        actions={
          <Button variant="primary" icon={<AppIcons.add />} onClick={() => setCreateOpen(true)}>
            เพิ่มผู้ใช้งาน
          </Button>
        }
      />

      <Inline gap={3} wrap>
        <SummaryCard title="ทั้งหมด" value={users.length} suffix="บัญชี" color={colors.brand.primary} style={{ flex: 1, minWidth: 140 }} />
        <SummaryCard title="Admin" value={adminCount} suffix="บัญชี" color={colors.semantic.error} style={{ flex: 1, minWidth: 140 }} />
        <SummaryCard title="ปฏิบัติงาน" value={operatorCount} suffix="บัญชี" color={colors.semantic.success} style={{ flex: 1, minWidth: 140 }} />
      </Inline>

      <Table<User>
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={isLoading}
        pagination={false}
        size="middle"
        scroll={{ x: 'max-content' }}
      />

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

      <FormModal
        open={!!editTarget}
        title={`เปลี่ยนบทบาท — ${editTarget?.username ?? ''}`}
        onClose={() => setEditTarget(null)}
        form={editForm}
        onFinish={async (raw) => {
          const { role } = raw as { role: Role };
          await updateRole.mutateAsync({ id: editTarget!.id, role });
          setEditTarget(null);
        }}
        loading={updateRole.isPending}
        submitLabel="บันทึก"
        width={360}
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
      </FormModal>
    </Stack>
  );
}
