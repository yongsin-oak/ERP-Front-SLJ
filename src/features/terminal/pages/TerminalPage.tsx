import { useMemo, useState } from 'react';
import { Table, Button, PageHeader, ActionCell, CodeCell, DateCell, SummaryCard , AppIcons, Tag, Badge, Inline, Stack } from '@design-system';
import type { ColumnType } from '@design-system';
import type { Role } from '@features/auth/types';
import { useSearchState, PAGINATION } from '@shared';
import {
  useTerminalList,
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

// annotate เป็น number ตรงๆ — PAGINATION เป็น `as const` ค่าเลยเป็น literal type
const LIST_DEFAULTS: { page: number; pageSize: number } = {
  page: PAGINATION.DEFAULT_PAGE,
  pageSize: PAGINATION.DEFAULT_LIMIT,
};

export function TerminalPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Terminal | null>(null);

  // แบ่งหน้าฝั่ง server — ไม่ดึง terminal ทั้งหมดมาไว้ในหน่วยความจำ
  const [tableState, setTableState] = useSearchState('terminal-list', LIST_DEFAULTS);
  const { page, pageSize } = tableState;

  const { data, isLoading } = useTerminalList({ page, limit: pageSize });
  const terminals = data?.data ?? [];
  const total = data?.pagination?.total ?? terminals.length;
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
          <div className="text-[11px] text-foreground-subtle">{r.id}</div>
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
      width: 56,
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
        subtitle={`${total} เครื่องในระบบ`}
        actions={
          <Button variant="primary" icon={<AppIcons.add />} onClick={openCreate}>
            เพิ่ม Terminal
          </Button>
        }
      />

      <Inline gap={3} wrap>
        <SummaryCard title="Terminal ทั้งหมด" value={total} suffix="เครื่อง" color="var(--color-primary)" style={{ flex: 1, minWidth: 140 }} />
        <SummaryCard title="เปิดใช้งาน" value={activeCount} suffix="เครื่อง" color="var(--color-success)" style={{ flex: 1, minWidth: 140 }} />
        <SummaryCard title="ปิดใช้งาน" value={inactiveCount} suffix="เครื่อง" color="var(--color-muted-foreground)" style={{ flex: 1, minWidth: 140 }} />
      </Inline>

      <Table<Terminal>
        rowKey="id"
        columns={columns}
        dataSource={terminals}
        loading={isLoading}
        size="middle"
        scroll={{ x: 'max-content' }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: (p, ps) => setTableState({ ...tableState, page: p, pageSize: ps }),
        }}
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
