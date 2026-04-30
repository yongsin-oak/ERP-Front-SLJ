import { Descriptions, Divider } from 'antd';
import dayjs from 'dayjs';
import { Modal, Table, Tag, Button } from '@design-system';
import type { ColumnType } from '@design-system';
import { OrderStatusLabel, OrderStatusColor } from '../types';
import type { Order, OrderItem } from '../types';

interface OrderDetailModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
}

export function OrderDetailModal({ open, order, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  const columns: ColumnType<OrderItem>[] = [
    {
      title: 'สินค้า',
      key: 'product',
      render: (_: unknown, record: OrderItem) => (
        <div>
          <div>{record.name}</div>
          <code style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>{record.barcode}</code>
        </div>
      ),
    },
    {
      title: 'ราคา/ชิ้น',
      dataIndex: 'sellingPrice',
      width: 110,
      align: 'right',
      render: (v: number) => `฿${v?.toLocaleString()}`,
    },
    {
      title: 'จำนวน',
      dataIndex: 'quantity',
      width: 80,
      align: 'center',
    },
    {
      title: 'รวม',
      key: 'total',
      width: 110,
      align: 'right',
      render: (_: unknown, record: OrderItem) => (
        <strong>฿{(record.sellingPrice * record.quantity).toLocaleString()}</strong>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      title={`Order ${order.orderNumber ?? order.id}`}
      onCancel={onClose}
      width={680}
      footer={<Button onClick={onClose}>ปิด</Button>}
    >
      <Descriptions size="small" column={2} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="สถานะ">
          <Tag color={OrderStatusColor[order.status]}>{OrderStatusLabel[order.status]}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="วันที่สร้าง">
          {order.createdAt ? dayjs(order.createdAt).format('DD/MM/YYYY HH:mm') : '-'}
        </Descriptions.Item>
        {order.employee && (
          <Descriptions.Item label="พนักงาน">
            {order.employee.firstName} {order.employee.lastName} ({order.employee.nickname})
          </Descriptions.Item>
        )}
        {order.note && <Descriptions.Item label="หมายเหตุ">{order.note}</Descriptions.Item>}
      </Descriptions>

      <Divider style={{ margin: '8px 0' }} />

      <Table<OrderItem>
        rowKey="barcode"
        columns={columns}
        dataSource={order.items}
        pagination={false}
        size="small"
      />

      <div
        style={{
          marginTop: 12,
          padding: '10px 16px',
          background: '#fafafa',
          borderRadius: 6,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 24,
        }}
      >
        <span>จำนวนรวม: <strong>{order.totalQuantity} ชิ้น</strong></span>
        <span>ยอดรวม: <strong style={{ fontSize: 15 }}>฿{order.totalSellingPrice?.toLocaleString()}</strong></span>
      </div>
    </Modal>
  );
}
