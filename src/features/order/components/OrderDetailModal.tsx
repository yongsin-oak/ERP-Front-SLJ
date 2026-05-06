import { Descriptions, Divider } from 'antd';
import dayjs from 'dayjs';
import { Modal, Table, Tag, Button } from '@design-system';
import type { ColumnType } from '@design-system';
import { OrderStatusLabel, OrderStatusColor } from '../types';
import type { Order, OrderDetail } from '../types';

interface OrderDetailModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
}

export function OrderDetailModal({ open, order, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  const details = order.orderDetails ?? [];
  const totalQty = details.reduce((s, d) => s + d.quantityPack + d.quantityCarton, 0);
  const totalPrice = details.reduce((s, d) => {
    const pack = d.product.sellPrice?.pack ?? 0;
    const carton = d.product.sellPrice?.carton ?? 0;
    return s + d.quantityPack * pack + d.quantityCarton * carton;
  }, 0);

  const columns: ColumnType<OrderDetail>[] = [
    {
      title: 'สินค้า',
      key: 'product',
      render: (_: unknown, r: OrderDetail) => (
        <div>
          <div>{r.product.name}</div>
          <code style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>{r.product.barcode}</code>
        </div>
      ),
    },
    {
      title: 'ราคา/แพ็ค',
      key: 'sellPrice',
      width: 110,
      align: 'right',
      render: (_: unknown, r: OrderDetail) => `฿${(r.product.sellPrice?.pack ?? 0).toLocaleString()}`,
    },
    {
      title: 'แพ็ค',
      dataIndex: 'quantityPack',
      width: 80,
      align: 'center',
    },
    {
      title: 'ลัง',
      dataIndex: 'quantityCarton',
      width: 80,
      align: 'center',
    },
    {
      title: 'รวม',
      key: 'total',
      width: 110,
      align: 'right',
      render: (_: unknown, r: OrderDetail) => {
        const pack = r.product.sellPrice?.pack ?? 0;
        const carton = r.product.sellPrice?.carton ?? 0;
        return <strong>฿{(r.quantityPack * pack + r.quantityCarton * carton).toLocaleString()}</strong>;
      },
    },
  ];

  return (
    <Modal
      open={open}
      title={`Order ${order.id}`}
      onCancel={onClose}
      width={720}
      footer={<Button onClick={onClose}>ปิด</Button>}
    >
      <Descriptions size="small" column={2} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="สถานะ">
          <Tag color={OrderStatusColor[order.status]}>{OrderStatusLabel[order.status]}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="วันที่บันทึก">
          {order.startRecordAt
            ? dayjs(order.startRecordAt).format('DD/MM/YYYY HH:mm')
            : order.createdAt
              ? dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')
              : '-'}
        </Descriptions.Item>
        {order.shop && (
          <Descriptions.Item label="ร้านค้า">
            {order.shop.name} ({order.shop.platform})
          </Descriptions.Item>
        )}
        {order.recordBy && (
          <Descriptions.Item label="ผู้บันทึก">
            {order.recordBy.firstName} {order.recordBy.lastName} ({order.recordBy.nickname})
          </Descriptions.Item>
        )}
        {order.note && <Descriptions.Item label="หมายเหตุ" span={2}>{order.note}</Descriptions.Item>}
      </Descriptions>

      <Divider style={{ margin: '8px 0' }} />

      <Table<OrderDetail>
        rowKey="id"
        columns={columns}
        dataSource={details}
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
        <span>จำนวนรวม: <strong>{totalQty.toLocaleString()} หน่วย</strong></span>
        <span>ยอดรวม: <strong style={{ fontSize: 15 }}>฿{totalPrice.toLocaleString()}</strong></span>
      </div>
    </Modal>
  );
}
