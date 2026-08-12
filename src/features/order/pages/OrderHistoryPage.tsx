import { useCallback, useMemo, useState } from 'react';
import { useSearchState } from '@shared';
import { useNavigate } from 'react-router-dom';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Table, Button, Tag, PageHeader, PageShell, Input, Select, BulkSelectionBar,
  AppIcons, ActionCell, DateRangePresets, Inline, Text,
} from '@design-system';
import type { ColumnType } from '@design-system';
import { downloadFile, showError, notify, getErrorMessage } from '@shared';
import { ShopSearchSelect } from '@features/shop/components/ShopSearchSelect';
import { EmployeeSearchSelect } from '@features/employee/components/EmployeeSearchSelect';
import {
  useOrders, useDeleteOrder, useBulkDeleteOrder, orderService,
} from '../react-query';
import { OrderDetailModal } from '../components';
import { OrderStatuses } from '../types';
import type { Order, OrderStatus, OrderDetail } from '../types';

/**
 * ค่าเริ่มต้นของหน้า — ช่วงวันที่คือ **วันนี้**
 *
 * เป็นฟังก์ชันไม่ใช่ค่าคงที่ระดับโมดูล เพราะ "วันนี้" ต้องคิดตอนเข้าหน้า ไม่ใช่ตอน import
 * (โมดูลถูก import ครั้งเดียวต่อการโหลดแอป ถ้าฝังค่าไว้ แท็บที่เปิดค้างข้ามคืนจะยังกรองวันเก่า)
 *
 * เหตุผลที่ default ไม่ใช่ "ทั้งหมด": ออเดอร์โตวันละหลายร้อย การเปิดหน้ามาแล้วโหลดทั้งปี
 * ช้าและไม่ตรงกับสิ่งที่คนเปิดหน้านี้อยากรู้ (งานของวันนี้) อยากดูย้อนหลังค่อยขยายช่วงเอง
 */
function makeDefaults() {
  const today = dayjs();
  return {
    search: '',
    status: '',
    shopId: '',
    employeeId: '',
    startDate: today.startOf('day').toISOString(),
    endDate: today.endOf('day').toISOString(),
    page: 1,
    pageSize: 20,
  };
}

const STATUS_OPTIONS = (Object.keys(OrderStatuses) as OrderStatus[]).map((s) => ({
  label: OrderStatuses[s].label,
  value: s,
}));

export function OrderHistoryPage() {
  const navigate = useNavigate();

  // ต้องเป็น object เดิมตลอดอายุ component เพราะ useSearchState เก็บไว้ใช้ตอน reset
  const defaults = useMemo(() => makeDefaults(), []);
  const [tableState, setTableState] = useSearchState('order-history', defaults);
  const { search, status, shopId, employeeId, startDate, endDate, page, pageSize } = tableState;

  const dateRange = useMemo<[Dayjs, Dayjs] | null>(
    () => (startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : null),
    [startDate, endDate],
  );

  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [exporting, setExporting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      status: status || undefined,
      shopId: shopId || undefined,
      employeeId: employeeId || undefined,
      search: search.trim() || undefined,
      dateFrom: dateRange?.[0].startOf('day').toISOString(),
      dateTo: dateRange?.[1].endOf('day').toISOString(),
    }),
    [page, pageSize, status, shopId, employeeId, search, dateRange],
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useOrders(queryParams);
  const orders = useMemo(() => data?.data ?? [], [data]);
  const total = data?.pagination?.total ?? 0;

  const deleteOrder = useDeleteOrder();
  const bulkDelete = useBulkDeleteOrder();

  /** patch ที่คงหน้าเดิมไว้ไม่ได้ — เปลี่ยนตัวกรองแล้วต้องเด้งกลับหน้า 1 เสมอ */
  const setFilter = useCallback(
    (patch: Partial<typeof defaults>) => setTableState({ ...tableState, ...patch, page: 1 }),
    [tableState, setTableState],
  );

  // นับเฉพาะตัวกรองที่ "ต่างจากค่าเริ่มต้น" — ช่วงวันที่ = วันนี้ ไม่ควรถูกนับว่าเป็นตัวกรองที่ผู้ใช้ตั้ง
  const activeCount = useMemo(() => {
    let n = 0;
    if (search) n++;
    if (status) n++;
    if (shopId) n++;
    if (employeeId) n++;
    if (startDate !== defaults.startDate || endDate !== defaults.endDate) n++;
    return n;
  }, [search, status, shopId, employeeId, startDate, endDate, defaults]);

  const resetFilters = useCallback(
    () => setTableState({ ...defaults, pageSize }),
    [setTableState, defaults, pageSize],
  );

  const handleBulkDelete = useCallback(async () => {
    await bulkDelete.mutateAsync(selectedKeys.map(String));
    setSelectedKeys([]);
  }, [bulkDelete, selectedKeys]);

  const openDetail = useCallback((order: Order) => {
    setSelected(order);
    setDetailOpen(true);
  }, []);

  async function handleExport() {
    setExporting(true);
    const key = notify.loading('กำลังส่งออก Excel ออเดอร์...');
    try {
      const res = await orderService.exportXlsx(queryParams);
      downloadFile(res.data as unknown as Blob, 'ออเดอร์.xlsx');
      notify.resolve(key, 'success', 'ส่งออก Excel ออเดอร์ สำเร็จ');
    } catch (err) {
      notify.dismiss(key);
      showError(err, 'ส่งออก Excel ออเดอร์');
    } finally {
      setExporting(false);
    }
  }

  /**
   * ทุกคอลัมน์เป็น "บรรทัดเดียว" โดยตั้งใจ
   *
   * เดิมยัดสองบรรทัดในช่องเดียว (เลขออเดอร์+เวลา, ชื่อร้าน+แพลตฟอร์ม) ทำให้แถวสูงไม่เท่ากัน
   * และไม่มีจังหวะให้กวาดสายตา — ตารางแบบนี้ควรมีคอลัมน์ที่ยืด/ตัดคำได้ **แค่คอลัมน์เดียว**
   * (ที่นี่คือ "หมายเหตุ") ที่เหลือกว้างคงที่ + `ellipsis` เพื่อบังคับความกว้างจริง
   *
   * `ellipsis` ไม่ได้แค่ทำจุดไข่ปลา — มันคือตัวที่ทำให้ `width` มีผลกับ `<td>` จริง
   * (ใส่ `max-w-0 truncate` ให้) ถ้าไม่ใส่ เนื้อหายาวๆ จะดันคอลัมน์บานจนตารางเสียทรง
   * และเมื่อ render คืน **string** ล้วน Table จะใส่ `title` ให้เอง = hover อ่านค่าเต็มได้
   *
   * ไม่ใส่ `sorter` เพราะข้อมูลแบ่งหน้าฝั่ง server — sorter ของ Table เรียงเฉพาะแถวในหน้านั้น
   * ซึ่งจะหลอกผู้ใช้ว่าเรียงทั้งชุดแล้ว
   */
  const columns = useMemo<ColumnType<Order>[]>(
    () => [
      {
        // คอลัมน์แรกมีปุ่มขยายแถวแทรกอยู่ด้วย → ไม่ใส่ ellipsis กัน truncate ไปกินปุ่ม
        // (ความยาวคงที่อยู่แล้ว ไม่มีทางล้น)
        title: 'เวลาบันทึก',
        key: 'recordedAt',
        width: 165,
        render: (_: unknown, r: Order) => (
          <span className="font-mono text-xs tabular-nums text-foreground-light">
            {formatRecordedAt(r)}
          </span>
        ),
      },
      {
        title: 'เลขคำสั่งซื้อ',
        key: 'orderNumber',
        width: 150,
        ellipsis: true,
        render: (_: unknown, r: Order) => (
          <span className="font-mono text-sm tabular-nums text-foreground">
            {r.orderNumber || '—'}
          </span>
        ),
      },
      {
        title: 'สถานะ',
        dataIndex: 'status',
        width: 110,
        render: (v: OrderStatus) =>
          v ? <Tag color={OrderStatuses[v].color}>{OrderStatuses[v].label}</Tag> : '—',
      },
      {
        title: 'ร้านค้า',
        key: 'shop',
        width: 190,
        ellipsis: true,
        // span เป็น inline ทั้งคู่ → truncate ที่ td คุมได้ (ถ้าเป็น flex/block จะหลุด)
        render: (_: unknown, r: Order) =>
          r.shop ? (
            <>
              <span className="text-foreground">{r.shop.name}</span>
              <span className="ml-1.5 text-xs text-foreground-lighter">{r.shop.platform}</span>
            </>
          ) : '—',
      },
      {
        title: 'ผู้บันทึก',
        key: 'recordBy',
        width: 150,
        ellipsis: true,
        render: (_: unknown, r: Order) =>
          r.recordBy ? `${r.recordBy.firstName} (${r.recordBy.nickname})` : '—',
      },
      {
        // ตัวเลขเชิงปริมาณ → ชิดขวา + mono ให้หลักตรงกันเวลาไล่สายตาลงมา
        // หัวคอลัมน์บอก "รายการ" แล้ว ในช่องจึงเหลือแค่ตัวเลข ไม่ต้องเขียนซ้ำ
        title: 'รายการ',
        key: 'items',
        width: 90,
        align: 'right',
        render: (_: unknown, r: Order) => (
          <span className="font-mono tabular-nums">{r.orderDetails?.length ?? 0}</span>
        ),
      },
      {
        // คอลัมน์เดียวที่ปล่อยให้ยืดตามพื้นที่เหลือ — คืน string ล้วนเพื่อให้ได้ title tooltip
        title: 'หมายเหตุ',
        key: 'note',
        ellipsis: true,
        render: (_: unknown, r: Order) => r.note || '—',
      },
      {
        title: '',
        key: 'action',
        width: 56,
        align: 'center' as const,
        fixed: 'right',
        render: (_: unknown, r: Order) => (
          <ActionCell
            actions={[
              { key: 'view', label: 'ดูรายละเอียด', icon: <AppIcons.view />, onSelect: () => openDetail(r) },
            ]}
            onDelete={async () => {
              setDeletingId(r.id);
              try {
                await deleteOrder.mutateAsync(r.id);
              } finally {
                setDeletingId(null);
              }
            }}
            isDeleting={deletingId === r.id}
            deleteTitle="ลบออเดอร์นี้?"
          />
        ),
      },
    ],
    [deleteOrder, deletingId, openDetail],
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="ประวัติออเดอร์"
        subtitle={rangeLabel(dateRange, total)}
        actions={
          <>
            <Button icon={<AppIcons.refresh />} onClick={() => refetch()} loading={isFetching} aria-label="รีเฟรช" />
            <Button icon={<AppIcons.exportFile />} onClick={handleExport} loading={exporting}>
              ส่งออก Excel
            </Button>
            <Button variant="primary" icon={<AppIcons.add />} onClick={() => navigate('/order')}>
              บันทึกออเดอร์
            </Button>
          </>
        }
      />

      {/* ── แถบตัวกรอง — แถวเดียว ไม่ต้องมีการ์ดครอบ ตามภาษาแบบ Supabase (ความลึกมาจากเส้น) ── */}
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3">
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePresets
            value={dateRange}
            onChange={(v) =>
              setFilter({
                startDate: v?.[0]?.toISOString() ?? '',
                endDate: v?.[1]?.toISOString() ?? '',
              })
            }
            format="DD/MM/YYYY"
            placeholder={['วันที่เริ่ม', 'วันที่สิ้นสุด']}
            className="w-full sm:w-64"
          />
          <Input
            prefix={<AppIcons.search />}
            placeholder="เลขออเดอร์ / หมายเหตุ"
            allowClear
            value={search}
            onChange={(e) => setFilter({ search: e.target.value })}
            className="w-full sm:w-56"
          />
          <Select
            allowClear
            placeholder="ทุกสถานะ"
            value={status || undefined}
            onChange={(v) => setFilter({ status: v ?? '' })}
            options={STATUS_OPTIONS}
            className="w-full sm:w-40"
          />
          <ShopSearchSelect
            allowClear
            placeholder="ทุกร้านค้า"
            value={shopId || undefined}
            onChange={(v) => setFilter({ shopId: v ?? '' })}
            className="w-full sm:w-48"
          />
          <EmployeeSearchSelect
            allowClear
            placeholder="ทุกพนักงาน"
            value={employeeId || undefined}
            onChange={(v) => setFilter({ employeeId: v ?? '' })}
            className="w-full sm:w-48"
          />

          {activeCount > 0 && (
            <Button variant="ghost" size="small" icon={<AppIcons.clear />} onClick={resetFilters}>
              ล้างตัวกรอง ({activeCount})
            </Button>
          )}
        </div>
      </div>

      {selectedKeys.length > 0 && (
        <BulkSelectionBar
          count={selectedKeys.length}
          isDeleting={bulkDelete.isPending}
          onDelete={handleBulkDelete}
          onClear={() => setSelectedKeys([])}
          itemLabel="ออเดอร์"
        />
      )}

      <PageShell
        isLoading={isLoading}
        isError={isError}
        errorMessage={getErrorMessage(error)}
        onRetry={refetch}
        isEmpty={orders.length === 0}
        emptyDescription={
          activeCount > 0
            ? 'ไม่พบออเดอร์ที่ตรงกับตัวกรอง'
            : `ยังไม่มีออเดอร์${dateRange ? 'ในช่วงวันที่ที่เลือก' : ''}`
        }
        emptyAction={
          activeCount > 0 ? (
            <Button icon={<AppIcons.clear />} onClick={resetFilters}>ล้างตัวกรอง</Button>
          ) : (
            <Button variant="primary" icon={<AppIcons.add />} onClick={() => navigate('/order')}>
              บันทึกออเดอร์แรก
            </Button>
          )
        }
      >
        <Table<Order>
          rowKey="id"
          columns={columns}
          dataSource={orders}
          // ผลรวมคอลัมน์คงที่ ~910 + ช่องเลือก — ต่ำกว่านี้ค่อยเลื่อนแนวนอน
          // ไม่ตั้งสูงกว่านี้ เพราะจะบังคับให้เลื่อนทั้งที่จอกว้างพอ
          scroll={{ x: 960 }}
          expandable={{
            rowExpandable: (r) => (r.orderDetails?.length ?? 0) > 0,
            expandedRowRender: (r) => <OrderItemsPanel items={r.orderDetails ?? []} />,
          }}
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: setSelectedKeys,
            preserveSelectedRowKeys: true,
          }}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p, ps) => setTableState({ ...tableState, page: p, pageSize: ps }),
          }}
        />
      </PageShell>

      <OrderDetailModal open={detailOpen} order={selected} onClose={() => setDetailOpen(false)} />
    </div>
  );
}

/* ── helpers ────────────────────────────────────────── */

/**
 * เวลาที่เริ่มบันทึกออเดอร์ — ถ้าไม่มีใช้ createdAt แทน
 * ตัดปีทิ้งเมื่อเป็นปีปัจจุบัน: ค่าเริ่มต้นของหน้าคือ "วันนี้" การย้ำ "/2026" ทุกแถว
 * กินความกว้างโดยไม่ได้บอกอะไรใหม่ — ข้ามปีเมื่อไหร่ปีจะโผล่มาเองให้เห็นความต่าง
 */
function formatRecordedAt(order: Order): string {
  const at = order.startRecordAt ?? order.createdAt;
  if (!at) return '—';
  const d = dayjs(at);
  return d.isSame(dayjs(), 'year') ? d.format('DD/MM HH:mm') : d.format('DD/MM/YYYY HH:mm');
}

/** คำบรรยายใต้หัวข้อ — บอกทั้งช่วงเวลาที่กำลังดูและจำนวนที่เจอ */
function rangeLabel(range: [Dayjs, Dayjs] | null, total: number): string {
  const count = `${total.toLocaleString()} รายการ`;
  if (!range) return `ทุกช่วงเวลา · ${count}`;
  const [from, to] = range;
  if (from.isSame(to, 'day')) {
    const label = from.isSame(dayjs(), 'day') ? 'วันนี้' : from.format('DD/MM/YYYY');
    return `${label} · ${count}`;
  }
  return `${from.format('DD/MM/YYYY')} – ${to.format('DD/MM/YYYY')} · ${count}`;
}

/** แผงรายการสินค้าที่บันทึกไว้ในออเดอร์ — แสดงตอนกดขยายแถว (ไม่โชว์ราคา) */
function OrderItemsPanel({ items }: { items: OrderDetail[] }) {
  if (!items.length) {
    return (
      <Inline className="px-2 py-1">
        <Text size="base" type="secondary">ไม่มีรายการสินค้า</Text>
      </Inline>
    );
  }
  return (
    <div className="overflow-hidden rounded-md border border-border bg-background">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-100 text-xs font-medium text-foreground-lighter">
            <th className="px-3 py-1.5 text-left">สินค้า</th>
            <th className="w-24 px-3 py-1.5 text-right">แพ็ค</th>
            <th className="w-24 px-3 py-1.5 text-right">ลัง</th>
          </tr>
        </thead>
        <tbody>
          {items.map((d) => (
            <tr key={d.id} className="border-b border-border-muted last:border-0">
              <td className="px-3 py-1.5">
                <div className="text-foreground">{d.product.name}</div>
                <div className="font-mono text-xs text-foreground-lighter">{d.product.barcode}</div>
              </td>
              <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                {d.quantityPack.toLocaleString()}
              </td>
              <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                {d.quantityCarton.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
