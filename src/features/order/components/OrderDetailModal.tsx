import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Modal, Table, Tag, Button, Divider, colors , AppIcons } from '@design-system';
import type { ColumnType } from '@design-system';
import { Spinner } from '@/components/ui/spinner';
import { useOrderDetail } from '../react-query';
import { OrderStatuses } from '../types';
import type { Order, OrderDetail } from '../types';

interface OrderDetailModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
}

export function OrderDetailModal({ open, order, onClose }: OrderDetailModalProps) {
  const navigate = useNavigate();
  const { data: freshOrder, isLoading } = useOrderDetail(open && order ? order.id : null);
  const displayOrder = freshOrder ?? order;

  function handleReorder() {
    if (!displayOrder?.orderDetails?.length) return;
    const items = displayOrder.orderDetails.map((d) => ({
      barcode: d.product.barcode,
      name: d.product.name,
      sellingPrice: d.product.sellPrice?.pack ?? d.product.sellPrice?.carton ?? 0,
      costPrice: d.product.costPrice?.pack ?? d.product.costPrice?.carton ?? 0,
      quantity: d.quantityPack + d.quantityCarton,
    }));
    onClose();
    navigate('/order', { state: { items } });
  }

  const details = displayOrder?.orderDetails ?? [];
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
          <code style={{ fontSize: 11, color: colors.text.tertiary }}>{r.product.barcode}</code>
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
      title={displayOrder ? `Order ${displayOrder.id}` : 'รายละเอียด Order'}
      onCancel={onClose}
      width={720}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            icon={<AppIcons.copy />}
            onClick={handleReorder}
            disabled={!details.length}
          >
            สั่งซ้ำ (Re-order)
          </Button>
          <Button onClick={onClose}>ปิด</Button>
        </div>
      }
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spinner size="sm" className="mx-auto" />
        </div>
      ) : displayOrder ? (
        <>
          <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm" style={{ marginBottom: 16 }}>
            <dt className="text-muted-foreground">สถานะ</dt>
            <dd className="text-foreground">
              <Tag color={OrderStatuses[displayOrder.status]?.color}>
                {OrderStatuses[displayOrder.status]?.label ?? displayOrder.status}
              </Tag>
            </dd>
            <dt className="text-muted-foreground">วันที่บันทึก</dt>
            <dd className="text-foreground">
              {displayOrder.startRecordAt
                ? dayjs(displayOrder.startRecordAt).format('DD/MM/YYYY HH:mm')
                : displayOrder.createdAt
                  ? dayjs(displayOrder.createdAt).format('DD/MM/YYYY HH:mm')
                  : '-'}
            </dd>
            {displayOrder.shop && (
              <>
                <dt className="text-muted-foreground">ร้านค้า</dt>
                <dd className="text-foreground">
                  {displayOrder.shop.name} ({displayOrder.shop.platform})
                </dd>
              </>
            )}
            {displayOrder.recordBy && (
              <>
                <dt className="text-muted-foreground">ผู้บันทึก</dt>
                <dd className="text-foreground">
                  {displayOrder.recordBy.firstName} {displayOrder.recordBy.lastName} ({displayOrder.recordBy.nickname})
                </dd>
              </>
            )}
            {displayOrder.note && (
              <>
                <dt className="text-muted-foreground">หมายเหตุ</dt>
                <dd className="text-foreground">{displayOrder.note}</dd>
              </>
            )}
          </dl>

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
              background: colors.neutral[50],
              borderRadius: 6,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 24,
            }}
          >
            <span>จำนวนรวม: <strong>{totalQty.toLocaleString()} หน่วย</strong></span>
            <span>ยอดรวม: <strong style={{ fontSize: 15 }}>฿{totalPrice.toLocaleString()}</strong></span>
          </div>
        </>
      ) : null}
    </Modal>
  );
}
