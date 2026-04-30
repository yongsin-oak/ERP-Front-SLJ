import { useState } from 'react';
import { Popconfirm, Space, Select as AntSelect } from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Table, Button, Tag, PageHeader } from '@design-system';
import type { ColumnType } from '@design-system';
import { useOrders, useCreateOrder, useUpdateOrder, useDeleteOrder } from '../hooks';
import { OrderFormModal, OrderDetailModal } from '../components';
import { OrderStatusLabel, OrderStatusColor } from '../types';
import type { Order, CreateOrderDto, OrderStatus } from '../types';

export function OrderPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const params = { page, limit: pageSize, status: filterStatus || undefined };
  const { data, isLoading, refetch } = useOrders(params);
  const orders = data?.data ?? [];
  const total = data?.total ?? 0;

  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();

  async function handleSubmit(values: CreateOrderDto) {
    if (selected) {
      await updateOrder.mutateAsync({ id: selected.id, data: values });
    } else {
      await createOrder.mutateAsync(values);
    }
    setFormOpen(false);
  }

  const columns: ColumnType<Order>[] = [
    {
      title: 'Order',
      key: 'orderNumber',
      render: (_: unknown, r: Order) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.orderNumber ?? `#${r.id.slice(0, 8)}`}</div>
          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
            {r.createdAt ? dayjs(r.createdAt).format('DD/MM/YYYY HH:mm') : '-'}
          </div>
        </div>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      width: 130,
      render: (v: OrderStatus) => <Tag color={OrderStatusColor[v]}>{OrderStatusLabel[v]}</Tag>,
    },
    {
      title: 'จำนวน',
      dataIndex: 'totalQuantity',
      width: 100,
      align: 'right',
      render: (v: number) => `${v?.toLocaleString()} ชิ้น`,
    },
    {
      title: 'ยอดรวม',
      dataIndex: 'totalSellingPrice',
      width: 120,
      align: 'right',
      render: (v: number) => <strong>฿{v?.toLocaleString()}</strong>,
    },
    {
      title: 'ร้านค้า',
      key: 'shop',
      width: 160,
      render: (_: unknown, r: Order) =>
        r.shop ? (
          <div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>{r.shop.name}</div>
            <Tag color="blue" style={{ fontSize: 11 }}>{r.shop.platform}</Tag>
          </div>
        ) : '-',
    },
    {
      title: 'พนักงาน',
      key: 'employee',
      width: 130,
      render: (_: unknown, r: Order) =>
        r.employee ? `${r.employee.firstName} (${r.employee.nickname})` : '-',
    },
    {
      title: 'หมายเหตุ',
      dataIndex: 'note',
      render: (v: string) => v ?? '-',
    },
    {
      title: '',
      key: 'action',
      width: 120,
      render: (_: unknown, r: Order) => (
        <Space>
          <Button
            variant="ghost" size="small" icon={<EyeOutlined />}
            onClick={() => { setSelected(r); setDetailOpen(true); }}
          />
          <Button
            variant="ghost" size="small" icon={<EditOutlined />}
            onClick={() => { setSelected(r); setFormOpen(true); }}
          />
          <Popconfirm
            title="ลบ order นี้?"
            onConfirm={() => deleteOrder.mutate(r.id)}
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
        title="Order"
        subtitle={`ทั้งหมด ${total} รายการ`}
        actions={
          <>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>รีเฟรช</Button>
            <Button variant="primary" icon={<PlusOutlined />} onClick={() => { setSelected(null); setFormOpen(true); }}>
              สร้าง Order
            </Button>
          </>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <AntSelect
          allowClear
          placeholder="กรองตามสถานะ"
          style={{ width: 180 }}
          onChange={(val) => { setFilterStatus(val ?? ''); setPage(1); }}
          options={[
            { label: 'รอดำเนินการ', value: 'pending' },
            { label: 'ยืนยันแล้ว', value: 'confirmed' },
            { label: 'จัดส่งแล้ว', value: 'shipped' },
            { label: 'สำเร็จ', value: 'completed' },
            { label: 'ยกเลิก', value: 'cancelled' },
          ]}
        />
      </div>

      <Table<Order>
        rowKey="id"
        columns={columns}
        dataSource={orders}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
      />

      <OrderFormModal
        open={formOpen}
        order={selected}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
      <OrderDetailModal
        open={detailOpen}
        order={selected}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
