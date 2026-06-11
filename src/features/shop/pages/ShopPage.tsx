import { useMemo, useState } from 'react';
import { Flex, Space } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  Table, Button, Tag, PageHeader, BulkSelectionBar, ActionCell,
  SummaryCard, DateCell, CodeCell, colors,
} from '@design-system';
import type { ColumnType } from '@design-system';
import { ShopFormModal } from '../components/ShopFormModal';
import { PlatformBadge } from '../components/PlatformBadge';
import { useShops, useCreateShop, useUpdateShop, useDeleteShop, useBulkDeleteShop } from '../react-query';
import { PlatformColor, PLATFORM_ORDER } from '../types';
import type { Shop, CreateShopDto, Platform } from '../types';

const ONLINE_PLATFORMS: Platform[] = ['Shopee', 'Lazada', 'TikTok', 'LineOA', 'LineMan'];

export function ShopPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Shop | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const { data: shops = [], isLoading, refetch, isFetching } = useShops();
  const createShop = useCreateShop();
  const updateShop = useUpdateShop();
  const deleteShop = useDeleteShop();
  const bulkDelete = useBulkDeleteShop();

  async function handleSubmit(values: CreateShopDto) {
    if (selected) {
      await updateShop.mutateAsync({ id: selected.id, data: values });
    } else {
      await createShop.mutateAsync(values);
    }
    setModalOpen(false);
  }

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(selectedKeys.map(String));
    setSelectedKeys([]);
  }

  const platformCounts = useMemo(() => {
    const m = new Map<Platform, number>();
    PLATFORM_ORDER.forEach((p) => m.set(p, 0));
    shops.forEach((s) => m.set(s.platform, (m.get(s.platform) ?? 0) + 1));
    return m;
  }, [shops]);

  const onlineCount = useMemo(
    () => shops.filter((s) => ONLINE_PLATFORMS.includes(s.platform)).length,
    [shops],
  );
  const offlineCount = useMemo(
    () => shops.filter((s) => s.platform === 'Offline').length,
    [shops],
  );

  const columns: ColumnType<Shop>[] = [
    {
      title: 'แพลตฟอร์ม',
      dataIndex: 'platform',
      width: 140,
      sorter: (a, b) => a.platform.localeCompare(b.platform),
      filters: PLATFORM_ORDER.map((p) => ({ text: p, value: p })),
      onFilter: (value, r) => r.platform === value,
      render: (v: Platform) => (
        <Space size={6}>
          <PlatformBadge platform={v} size={18} />
          <Tag color={PlatformColor[v]} style={{ margin: 0 }}>{v}</Tag>
        </Space>
      ),
    },
    {
      title: 'ชื่อร้าน',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      searchable: true,
      defaultSortOrder: 'ascend',
      render: (v: string) => <strong>{v}</strong>,
    },
    {
      title: 'รหัส',
      dataIndex: 'id',
      width: 180,
      searchable: true,
      render: (v: string) => <CodeCell>{v}</CodeCell>,
    },
    {
      title: 'รายละเอียด',
      dataIndex: 'description',
      ellipsis: true,
      render: (v?: string) => v || '-',
    },
    {
      title: 'อัปเดตล่าสุด',
      dataIndex: 'updatedAt',
      width: 160,
      sorter: (a, b) => (a.updatedAt ?? '').localeCompare(b.updatedAt ?? ''),
      render: (v?: string) => <DateCell value={v} />,
    },
    {
      title: '',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_: unknown, r: Shop) => (
        <ActionCell
          onEdit={() => { setSelected(r); setModalOpen(true); }}
          onDelete={() => deleteShop.mutate(r.id)}
          isDeleting={deleteShop.isPending}
          deleteTitle="ลบร้านค้านี้?"
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="จัดการร้านค้า"
        subtitle={
          <Space size={10}>
            <span>ทั้งหมด {shops.length} ร้าน</span>
            {PLATFORM_ORDER.map((p) => (
              <Space key={p} size={4}>
                <PlatformBadge platform={p} size={14} />
                <span style={{ fontSize: 12 }}>{platformCounts.get(p) ?? 0}</span>
              </Space>
            ))}
          </Space>
        }
        actions={
          <>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
              รีเฟรช
            </Button>
            <Button variant="primary" icon={<PlusOutlined />} onClick={() => { setSelected(null); setModalOpen(true); }}>
              เพิ่มร้านค้า
            </Button>
          </>
        }
      />

      <Flex gap={12} wrap style={{ marginBottom: 16 }}>
        <SummaryCard title="ร้านทั้งหมด" value={shops.length} suffix="ร้าน" color={colors.brand.primary} style={{ flex: 1, minWidth: 140 }} />
        <SummaryCard title="ออนไลน์" value={onlineCount} suffix="ร้าน" color={colors.semantic.success} style={{ flex: 1, minWidth: 140 }} />
        <SummaryCard title="ออฟไลน์" value={offlineCount} suffix="ร้าน" color={colors.text.secondary} style={{ flex: 1, minWidth: 140 }} />
      </Flex>

      {selectedKeys.length > 0 && (
        <BulkSelectionBar
          count={selectedKeys.length}
          isDeleting={bulkDelete.isPending}
          onDelete={handleBulkDelete}
          onClear={() => setSelectedKeys([])}
        />
      )}

      <Table<Shop>
        rowKey="id"
        columns={columns}
        dataSource={shops}
        loading={isLoading}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: setSelectedKeys,
          preserveSelectedRowKeys: true,
        }}
        scroll={{ x: 'max-content' }}
      />

      <ShopFormModal
        open={modalOpen}
        shop={selected}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={createShop.isPending || updateShop.isPending}
      />
    </div>
  );
}
