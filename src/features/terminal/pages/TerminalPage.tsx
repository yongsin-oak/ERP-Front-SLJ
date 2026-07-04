import { useMemo, useState } from 'react';
import { Table, Button, PageHeader, colors, ActionCell, CodeCell, DateCell, SummaryCard , AppIcons, Tag, Badge, Inline, Stack } from '@design-system';
import type { ColumnType } from '@design-system';
import type { Role } from '@features/auth/types';
import {
  useTerminals,
  useCreateTerminal,
  useUpdateTerminal,
  useDeleteTerminal,
} from '../react-query';
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

  const activeCount = useMemo(() => terminals.filter((t) => t.isActive).length, [terminals]);
  const inactiveCount = useMemo(() => terminals.filter((t) => !t.isActive).length, [terminals]);

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

  const columns: ColumnType<Terminal>[] = [
    {
      title: 'Terminal Code',
      dataIndex: 'terminalCode',
      width: 140,
      render: (v: string) => <CodeCell>{v}</CodeCell>,
    },
    {
      title: 'ชื่อ Terminal',
      dataIndex: 'name',
      render: (v: string, r: Terminal) => (
        <div>
          <div style={{ fontWeight: 500 }}>{v}</div>
          <div style={{ fontSize: 11, color: colors.text.tertiary }}>{r.id}</div>
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
        <Badge status={v ? 'success' : 'default'} text={v ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} />
      ),
    },
    {
      title: 'สร้างเมื่อ',
      dataIndex: 'createdAt',
      width: 130,
      render: (v: string) => <DateCell value={v} format="DD/MM/YY HH:mm" />,
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      align: 'right' as const,
      render: (_: unknown, r: Terminal) => (
        <ActionCell
          onEdit={() => openEdit(r)}
          onDelete={() => deleteTerminal.mutate(r.id)}
          isDeleting={deleteTerminal.isPending}
          deleteTitle="ลบ Terminal นี้?"
          deleteDescription={`"${r.name}" จะถูกลบออกจากระบบ`}
        />
      ),
    },
  ];

  return (
    <Stack gap={4}>
      <PageHeader
        title="Terminal"
        subtitle={`${terminals.length} เครื่องในระบบ`}
        actions={
          <Button variant="primary" icon={<AppIcons.add />} onClick={openCreate}>
            เพิ่ม Terminal
          </Button>
        }
      />

      <Inline gap={3} wrap>
        <SummaryCard title="Terminal ทั้งหมด" value={terminals.length} suffix="เครื่อง" color={colors.brand.primary} style={{ flex: 1, minWidth: 140 }} />
        <SummaryCard title="เปิดใช้งาน" value={activeCount} suffix="เครื่อง" color={colors.semantic.success} style={{ flex: 1, minWidth: 140 }} />
        <SummaryCard title="ปิดใช้งาน" value={inactiveCount} suffix="เครื่อง" color={colors.text.secondary} style={{ flex: 1, minWidth: 140 }} />
      </Inline>

      <Table<Terminal>
        rowKey="id"
        columns={columns}
        dataSource={terminals}
        loading={isLoading}
        pagination={false}
        size="middle"
        scroll={{ x: 'max-content' }}
      />

      <TerminalFormModal
        open={modalOpen}
        terminal={selected}
        onClose={handleClose}
        onSubmit={handleSubmit}
        loading={createTerminal.isPending || updateTerminal.isPending}
      />
    </Stack>
  );
}
