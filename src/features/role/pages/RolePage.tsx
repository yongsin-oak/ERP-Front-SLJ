import { useMemo, useState } from 'react';
import { Space, Tag, Alert } from 'antd';
import { CrownOutlined, SafetyOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Table, PageHeader, Card, Tag as DSTag } from '@design-system';
import type { ColumnType } from '@design-system';
import type { Role } from '@features/auth/types';

interface RoleRow {
  role: Role;
  description: string;
  scope: string[];
  isSuperAdmin?: boolean;
}

const ROLES: RoleRow[] = [
  { role: 'SuperAdmin', description: 'ผู้ดูแลระบบสูงสุด — เข้าถึงทุกอย่าง', scope: ['ALL'], isSuperAdmin: true },
  { role: 'Admin',      description: 'ผู้ดูแลระบบ', scope: ['Order', 'Inventory', 'Reports'] },
  { role: 'Operator',   description: 'พนักงานบันทึกออเดอร์ทั่วไป', scope: ['Order'] },
  { role: 'Warehouse',  description: 'พนักงานคลัง — รับ/ปรับสต๊อก', scope: ['Inventory', 'StockEntry'] },
  { role: 'Accountant', description: 'แผนกบัญชี', scope: ['Reports', 'Order'] },
  { role: 'HR',         description: 'แผนกทรัพยากรบุคคล', scope: ['Employee'] },
  { role: 'Marketing',  description: 'แผนกการตลาด', scope: ['Shop', 'Product'] },
  { role: 'Sales',      description: 'แผนกขาย', scope: ['Order', 'Shop'] },
];

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

// Permission matrix — ปรับตามจริงที่ backend implement
const FEATURES = [
  { key: 'order_view',     label: 'ดู Order' },
  { key: 'order_create',   label: 'สร้าง Order' },
  { key: 'order_delete',   label: 'ลบ Order' },
  { key: 'product_view',   label: 'ดูสินค้า' },
  { key: 'product_manage', label: 'จัดการสินค้า' },
  { key: 'stock_manage',   label: 'จัดการสต๊อก' },
  { key: 'employee_view',  label: 'ดูพนักงาน' },
  { key: 'employee_manage',label: 'จัดการพนักงาน' },
  { key: 'shop_manage',    label: 'จัดการร้านค้า' },
  { key: 'role_manage',    label: 'จัดการบทบาท' },
];

const PERMISSION_MATRIX: Record<Role, Set<string>> = {
  SuperAdmin: new Set(FEATURES.map((f) => f.key)),
  Admin: new Set([
    'order_view', 'order_create', 'order_delete',
    'product_view', 'product_manage', 'stock_manage',
    'employee_view', 'shop_manage',
  ]),
  Operator: new Set(['order_view', 'order_create', 'product_view']),
  Warehouse: new Set(['product_view', 'stock_manage', 'order_view']),
  Accountant: new Set(['order_view', 'product_view', 'employee_view']),
  HR: new Set(['employee_view', 'employee_manage']),
  Marketing: new Set(['product_view', 'product_manage', 'shop_manage']),
  Sales: new Set(['order_view', 'order_create', 'product_view', 'shop_manage']),
};

export function RolePage() {
  const [activeRole, setActiveRole] = useState<Role>('SuperAdmin');

  const roleColumns: ColumnType<RoleRow>[] = [
    {
      title: 'บทบาท',
      dataIndex: 'role',
      width: 160,
      sorter: (a, b) => a.role.localeCompare(b.role),
      filters: ROLES.map((r) => ({ text: r.role, value: r.role })),
      onFilter: (v, r) => r.role === v,
      render: (v: Role, r) => (
        <Space size={6}>
          {r.isSuperAdmin ? <CrownOutlined style={{ color: '#fa541c' }} /> : <SafetyOutlined style={{ color: '#8c8c8c' }} />}
          <Tag color={ROLE_COLORS[v]} style={{ fontWeight: 600 }}>{v}</Tag>
        </Space>
      ),
    },
    {
      title: 'คำอธิบาย',
      dataIndex: 'description',
      searchable: true,
    },
    {
      title: 'ขอบเขต',
      dataIndex: 'scope',
      width: 280,
      render: (v: string[]) => (
        <Space size={4} wrap>
          {v.map((s) => <Tag key={s}>{s}</Tag>)}
        </Space>
      ),
    },
    {
      title: 'จำนวนสิทธิ์',
      key: 'permCount',
      width: 110,
      align: 'center',
      sorter: (a, b) => (PERMISSION_MATRIX[a.role]?.size ?? 0) - (PERMISSION_MATRIX[b.role]?.size ?? 0),
      render: (_, r) => {
        const n = PERMISSION_MATRIX[r.role]?.size ?? 0;
        return <DSTag status={n === FEATURES.length ? 'success' : n > 5 ? 'info' : 'default'}>
          {n} / {FEATURES.length}
        </DSTag>;
      },
    },
  ];

  const matrixData = useMemo(
    () => FEATURES.map((f) => {
      const row: Record<string, unknown> = { key: f.key, feature: f.label };
      ROLES.forEach((r) => {
        row[r.role] = PERMISSION_MATRIX[r.role]?.has(f.key) ?? false;
      });
      return row;
    }),
    [],
  );

  const matrixColumns: ColumnType<Record<string, unknown>>[] = [
    {
      title: 'ฟีเจอร์',
      dataIndex: 'feature',
      width: 180,
      fixed: 'left',
      render: (v: string) => <strong>{v}</strong>,
    },
    ...ROLES.map((r) => ({
      title: (
        <Space size={4}>
          {r.isSuperAdmin && <CrownOutlined style={{ color: '#fa541c' }} />}
          <Tag color={ROLE_COLORS[r.role]} style={{ margin: 0, fontSize: 11 }}>{r.role}</Tag>
        </Space>
      ),
      dataIndex: r.role,
      width: 120,
      align: 'center' as const,
      onCell: () => (r.role === activeRole ? { style: { background: '#fff7e6' } } : {}),
      onHeaderCell: () => ({
        onClick: () => setActiveRole(r.role),
        style: { cursor: 'pointer', background: r.role === activeRole ? '#fff7e6' : undefined },
      }),
      render: (v: boolean) => v
        ? <CheckOutlined style={{ color: '#52c41a', fontSize: 16 }} />
        : <CloseOutlined style={{ color: '#d9d9d9' }} />,
    })),
  ];

  return (
    <div>
      <PageHeader
        title="จัดการบทบาท (Roles)"
        subtitle={`ทั้งหมด ${ROLES.length} บทบาทในระบบ`}
      />

      <Alert
        type="info"
        showIcon
        message="ข้อมูลอ้างอิง (Read-only)"
        description="API ปัจจุบันยังไม่รองรับการแก้ไขสิทธิ์ — Role และ permission ถูก hardcode ใน backend ตาม .claude/API.md หน้านี้ใช้สำหรับดูภาพรวมว่าแต่ละบทบาทมีสิทธิ์ทำอะไรได้บ้าง"
        style={{ marginBottom: 16 }}
      />

      <Card title="รายการบทบาท" style={{ marginBottom: 16 }}>
        <Table<RoleRow>
          rowKey="role"
          columns={roleColumns}
          dataSource={ROLES}
          pagination={false}
          rowClassName={(r) => (r.role === activeRole ? 'ant-table-row-selected' : '')}
          onRow={(r) => ({ onClick: () => setActiveRole(r.role), style: { cursor: 'pointer' } })}
        />
      </Card>

      <Card title="Permission Matrix">
        <Table
          rowKey="key"
          columns={matrixColumns}
          dataSource={matrixData}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
}
