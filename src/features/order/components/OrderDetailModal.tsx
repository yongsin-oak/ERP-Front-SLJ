import { useNavigate } from 'react-router-dom';
import { Dialog } from 'radix-ui';
import { AppIcons } from '@/lib/icons';
import { formatDate, formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  btn,
  CELL_CODE,
  dataPill,
  DIALOG_CLOSE_X,
  DIALOG_CONTENT_LG,
  DIALOG_OVERLAY,
  DIALOG_TITLE,
  SEPARATOR_H,
  TABLE,
  TABLE_TD,
  TABLE_TH,
  TABLE_TR,
  TABLE_WRAP,
  TEXT,
} from '@/lib/styles';
import { useOrderDetail } from '../react-query';
import { OrderStatuses } from '../types';
import type { Order, OrderItem } from '../types';

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
    const items: OrderItem[] = displayOrder.orderDetails.map((d) => ({
      barcode: d.product.barcode,
      name: d.product.name,
      quantity: d.quantityPack,
      quantityCarton: d.quantityCarton,
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

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={DIALOG_OVERLAY} />
        <Dialog.Content
          className={cn(DIALOG_CONTENT_LG, 'max-h-[85vh] overflow-y-auto')}
          aria-describedby={undefined}
        >
          <Dialog.Title className={DIALOG_TITLE}>
            {displayOrder?.orderNumber ?
              `คำสั่งซื้อ ${displayOrder.orderNumber}`
            : 'รายละเอียด Order'}
          </Dialog.Title>
          <Dialog.Close asChild>
            <button type="button" aria-label="ปิด" className={DIALOG_CLOSE_X}>
              <AppIcons.close />
            </button>
          </Dialog.Close>

          {isLoading ?
            <div className="py-10 text-center">
              <AppIcons.loading spin className="mx-auto size-5 text-primary" />
            </div>
          : displayOrder ?
            <>
              <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
                <dt className={TEXT.muted}>สถานะ</dt>
                <dd className="m-0 text-foreground">
                  <span className={dataPill(OrderStatuses[displayOrder.status].color)}>
                    {OrderStatuses[displayOrder.status].label}
                  </span>
                </dd>

                {displayOrder.orderNumber && (
                  <>
                    <dt className={TEXT.muted}>เลขคำสั่งซื้อ</dt>
                    <dd className="m-0 text-foreground">
                      <code className={CELL_CODE}>{displayOrder.orderNumber}</code>
                    </dd>
                  </>
                )}

                <dt className={TEXT.muted}>วันที่บันทึก</dt>
                <dd className="m-0 font-mono text-foreground tabular-nums">
                  {formatDate(displayOrder.startRecordAt ?? displayOrder.createdAt)}
                </dd>

                {displayOrder.shop && (
                  <>
                    <dt className={TEXT.muted}>ร้านค้า</dt>
                    <dd className="m-0 text-foreground">
                      {displayOrder.shop.name} ({displayOrder.shop.platform})
                    </dd>
                  </>
                )}

                {displayOrder.recordBy && (
                  <>
                    <dt className={TEXT.muted}>ผู้บันทึก</dt>
                    <dd className="m-0 text-foreground">
                      {displayOrder.recordBy.firstName} {displayOrder.recordBy.lastName} (
                      {displayOrder.recordBy.nickname})
                    </dd>
                  </>
                )}

                {displayOrder.terminal && (
                  <>
                    <dt className={TEXT.muted}>เครื่อง (Terminal)</dt>
                    <dd className="m-0 text-foreground">
                      {displayOrder.terminal.name} ({displayOrder.terminal.terminalCode})
                    </dd>
                  </>
                )}

                {displayOrder.note && (
                  <>
                    <dt className={TEXT.muted}>หมายเหตุ</dt>
                    <dd className="m-0 text-foreground">{displayOrder.note}</dd>
                  </>
                )}
              </dl>

              <div className={SEPARATOR_H} />

              <div className={TABLE_WRAP}>
                <table className={TABLE}>
                  <thead>
                    <tr>
                      <th className={TABLE_TH}>สินค้า</th>
                      <th className={cn(TABLE_TH, 'w-28 text-right')}>ราคา/แพ็ค</th>
                      <th className={cn(TABLE_TH, 'w-20 text-center')}>แพ็ค</th>
                      <th className={cn(TABLE_TH, 'w-20 text-center')}>ลัง</th>
                      <th className={cn(TABLE_TH, 'w-28 text-right')}>รวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.map((r) => {
                      const pack = r.product.sellPrice?.pack ?? 0;
                      const carton = r.product.sellPrice?.carton ?? 0;
                      return (
                        <tr key={r.id} className={TABLE_TR}>
                          <td className={TABLE_TD}>
                            <div>{r.product.name}</div>
                            <code className="text-[11px] text-foreground-subtle">
                              {r.product.barcode}
                            </code>
                          </td>
                          <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                            {formatMoney(pack)}
                          </td>
                          <td className={cn(TABLE_TD, 'text-center font-mono tabular-nums')}>
                            {r.quantityPack}
                          </td>
                          <td className={cn(TABLE_TD, 'text-center font-mono tabular-nums')}>
                            {r.quantityCarton}
                          </td>
                          <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                            <strong>
                              {formatMoney(r.quantityPack * pack + r.quantityCarton * carton)}
                            </strong>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap justify-end gap-6 rounded-md bg-surface-200 px-4 py-2.5 text-sm">
                <span>
                  จำนวนรวม: <strong className="font-mono tabular-nums">{totalQty.toLocaleString()} หน่วย</strong>
                </span>
                <span>
                  ยอดรวม:{' '}
                  <strong className="font-mono text-base tabular-nums">
                    {formatMoney(totalPrice)}
                  </strong>
                </span>
              </div>
            </>
          : null}

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              className={btn()}
              onClick={handleReorder}
              disabled={!details.length}
            >
              <AppIcons.copy />
              สั่งซ้ำ (Re-order)
            </button>
            <Dialog.Close asChild>
              <button type="button" className={btn()}>
                ปิด
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
