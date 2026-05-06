import { useState } from 'react';
import { Tag, Popconfirm, Space, Tooltip, Badge } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Table, Button, PageHeader } from '@design-system';
import type { ColumnType } from '@design-system';
import type { Role } from '@features/auth/types';
import { useTerminals, useCreateTerminal, useUpdateTerminal, useDeleteTerminal } from '../hooks';
import { TerminalFormModal } from '../components/TerminalFormModal';
import type { Terminal, CreateTerminalDto, UpdateTerminalDto } from '../types';

const ROLE_COLOR: Record<Role, string> = {
  SuperAdmin: 'red', Admin: 'orange', Operator: 'blue', Warehouse: 'cyan',
  Accountant: 'green', HR: 'purple', Marketing: 'magenta', Sales: 'gold',
};

export function TerminalPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Terminal | null>(null);

  const { data: terminals = [], isLoading } = useTerminals();
  const createTerminal = useCreateTerminal();
  const updateTerminal = useUpdateTerminal();
  const deleteTerminal = useDeleteTerminal();

  function openCreate() { setSelected(null); setModalOpen(true); }
  function openEdit(t: Terminal) { setSelected(t); setModalOpen(true); }
  function handleClose() { setModalOpen(false); setSelected(null); }

  async function handleSubmit(values: CreateTerminalDto | UpdateTerminalDto) {
    if (selected) {
      await updateTerminal.mutateAsync({ id: selected.id, data: values as UpdateTerminalDto });
    } else {
      await createTerminal.mutateAsync(values as CreateTerminalDto);
    }
  }

  const columns: ColumnType<Terminal>[] = [
    {
      title: 'Terminal Code',
      dataIndex: 'terminalCode',
      width: 140,
      render: (v: string) => (
        <code style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>{v}</code>
      ),
    },
    {
      title: 'ชื่อ Terminal',
      dataIndex: 'name',
      render: (v: string, r: Terminal) => (
        <div>
          <div style={{ fontWeight: 500 }}>{v}</div>
          <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>{r.id}</div>
        </div>
      ),
    },
    {
      title: 'บทบาท',
      dataIndex: 'role',
      width: 130,
      render: (v: Role) => <Tag color={ROLE_COLOR[v]}>{v}</Tag>,
    },
    {
      title: 'สถานะ',
      dataIndex: 'isActive',
      width: 110,
      render: (v: boolean) => (
        <Badge
          status={v ? 'success' : 'default'}
          text={v ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
        />
      ),
    },
    {
      title: 'สร้างเมื่อ',
      dataIndex: 'createdAt',
      width: 130,
      render: (v: string) => dayjs(v).format('DD/MM/YY HH:mm'),
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      align: 'right' as const,
      render: (_: unknown, r: Terminal) => (
        <Space size={4}>
          <Tooltip title="แก้ไข">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          </Tooltip>
          <Popconfirm
            title="ลบ Terminal นี้?"
            description={`"${r.name}" จะถูกลบออกจากระบบ`}
            okText="ลบ"
            okButtonProps={{ danger: true }}
            cancelText="ยกเลิก"
            onConfirm={() => deleteTerminal.mutate(r.id)}
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
        title={<Space><DesktopOutlined />Terminal</Space>}
        subtitle={`${terminals.length} เครื่องในระบบ`}
        actions={
          <Button variant="primary" icon={<PlusOutlined />} onClick={openCreate}>
            เพิ่ม Terminal
          </Button>
        }
      />

      <Table<Terminal>
        rowKey="id"
        columns={columns}
        dataSource={terminals}
        loading={isLoading}
        pagination={false}
        size="middle"
      />

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
