import { useState } from 'react';
import { Form, InputNumber, Space } from 'antd';
import { Modal, Table, Button, FormModal, DeleteConfirmButton, Select, Tag, colors , AppIcons } from '@design-system';
import type { ColumnType } from '@design-system';
import { useShops } from '@features/shop';
import { PlatformBadge } from '@features/shop';
import { useShopPrices, useCreateShopPrice, useUpdateShopPrice, useDeleteShopPrice } from '../react-query';
import type { ShopPrice, CreateShopPriceDto } from '../types';

interface Props {
  open: boolean;
  barcode: string;
  productName: string;
  onClose: () => void;
}

interface FormValues {
  shopId: string;
  sellPack?: number;
  sellCarton?: number;
  costPack?: number;
  costCarton?: number;
}

export function ShopPriceModal({ open, barcode, productName, onClose }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ShopPrice | null>(null);
  const [form] = Form.useForm<FormValues>();

  const { data: prices = [], isLoading } = useShopPrices(barcode, { enabled: open });
  const { data: shops = [] } = useShops();

  const create = useCreateShopPrice(barcode);
  const update = useUpdateShopPrice(barcode);
  const remove = useDeleteShopPrice(barcode);

  function openAdd() {
    setEditing(null);
    form.resetFields();
    setFormOpen(true);
  }

  function openEdit(price: ShopPrice) {
    setEditing(price);
    form.setFieldsValue({
      sellPack: price.sellPrice?.pack,
      sellCarton: price.sellPrice?.carton,
      costPack: price.costPrice?.pack,
      costCarton: price.costPrice?.carton,
    });
    setFormOpen(true);
  }

  async function handleFinish(raw: unknown) {
    const values = raw as FormValues;
    const dto: CreateShopPriceDto = {
      shopId: editing?.shopId ?? values.shopId,
      sellPrice: { pack: values.sellPack, carton: values.sellCarton },
      costPrice: (values.costPack != null || values.costCarton != null)
        ? { pack: values.costPack, carton: values.costCarton }
        : undefined,
    };
    if (editing) {
      await update.mutateAsync({ shopId: editing.shopId, dto });
    } else {
      await create.mutateAsync(dto);
    }
    setFormOpen(false);
  }

  const shopMap = new Map(shops.map((s) => [s.id, s]));
  const usedShopIds = new Set(prices.map((p) => p.shopId));
  const availableShops = shops.filter((s) => !usedShopIds.has(s.id));

  const columns: ColumnType<ShopPrice>[] = [
    {
      title: 'ร้านค้า',
      key: 'shop',
      render: (_: unknown, r: ShopPrice) => {
        const shop = shopMap.get(r.shopId);
        return shop ? (
          <Space size={6}>
            <PlatformBadge platform={shop.platform} size={16} />
            <span>{shop.name}</span>
          </Space>
        ) : r.shopId;
      },
    },
    {
      title: 'Platform',
      key: 'platform',
      width: 100,
      render: (_: unknown, r: ShopPrice) => {
        const platform = shopMap.get(r.shopId)?.platform;
        return platform ? <Tag color="blue" style={{ margin: 0 }}>{platform}</Tag> : '-';
      },
    },
    {
      title: 'ราคาขาย / Pack',
      key: 'sellPack',
      width: 130,
      align: 'right',
      render: (_: unknown, r: ShopPrice) =>
        r.sellPrice?.pack != null
          ? <span style={{ color: colors.semantic.successText, fontWeight: 500 }}>฿{r.sellPrice.pack.toLocaleString()}</span>
          : <span style={{ color: colors.text.tertiary }}>—</span>,
    },
    {
      title: 'ราคาขาย / Carton',
      key: 'sellCarton',
      width: 140,
      align: 'right',
      render: (_: unknown, r: ShopPrice) =>
        r.sellPrice?.carton != null
          ? <span style={{ color: colors.semantic.successText, fontWeight: 500 }}>฿{r.sellPrice.carton.toLocaleString()}</span>
          : <span style={{ color: colors.text.tertiary }}>—</span>,
    },
    {
      title: 'ราคาทุน / Pack',
      key: 'costPack',
      width: 130,
      align: 'right',
      render: (_: unknown, r: ShopPrice) =>
        r.costPrice?.pack != null
          ? <span style={{ color: colors.text.secondary }}>฿{r.costPrice.pack.toLocaleString()}</span>
          : <span style={{ color: colors.text.tertiary }}>—</span>,
    },
    {
      title: 'ราคาทุน / Carton',
      key: 'costCarton',
      width: 140,
      align: 'right',
      render: (_: unknown, r: ShopPrice) =>
        r.costPrice?.carton != null
          ? <span style={{ color: colors.text.secondary }}>฿{r.costPrice.carton.toLocaleString()}</span>
          : <span style={{ color: colors.text.tertiary }}>—</span>,
    },
    {
      title: '',
      key: 'action',
      width: 90,
      render: (_: unknown, r: ShopPrice) => (
        <Space>
          <Button variant="ghost" size="small" onClick={() => openEdit(r)}>แก้ไข</Button>
          <DeleteConfirmButton onConfirm={() => remove.mutate(r.shopId)} size="small" />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        open={open}
        title={`ราคาร้านค้าเฉพาะ — ${productName}`}
        onCancel={onClose}
        footer={null}
        width={860}
        destroyOnHidden
      >
        <div style={{ marginBottom: 12, textAlign: 'right' }}>
          <Button
            variant="primary"
            icon={<AppIcons.add />}
            onClick={openAdd}
            disabled={availableShops.length === 0}
          >
            เพิ่มราคาร้านค้า
          </Button>
        </div>
        <Table<ShopPrice>
          rowKey="id"
          columns={columns}
          dataSource={prices}
          loading={isLoading}
          pagination={false}
          scroll={{ x: 760 }}
        />
      </Modal>

      <FormModal
        open={formOpen}
        title={editing ? 'แก้ไขราคาร้านค้า' : 'เพิ่มราคาร้านค้า'}
        form={form}
        onClose={() => setFormOpen(false)}
        onFinish={handleFinish}
        loading={editing ? update.isPending : create.isPending}
        submitLabel={editing ? 'บันทึก' : 'เพิ่ม'}
        width={480}
      >
        <Form form={form} layout="vertical">
          {!editing && (
            <Form.Item name="shopId" label="ร้านค้า" rules={[{ required: true, message: 'กรุณาเลือกร้านค้า' }]}>
              <Select
                placeholder="เลือกร้านค้า"
                options={availableShops.map((s) => ({ label: `${s.name} (${s.platform})`, value: s.id }))}
                showSearch={{ optionFilterProp: 'label' }}
              />
            </Form.Item>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="sellPack" label="ราคาขาย / Pack (฿)">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="ไม่กำหนด" />
            </Form.Item>
            <Form.Item name="sellCarton" label="ราคาขาย / Carton (฿)">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="ไม่กำหนด" />
            </Form.Item>
            <Form.Item name="costPack" label="ราคาทุน / Pack (฿)">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="ไม่กำหนด" />
            </Form.Item>
            <Form.Item name="costCarton" label="ราคาทุน / Carton (฿)">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="ไม่กำหนด" />
            </Form.Item>
          </div>
        </Form>
      </FormModal>
    </>
  );
}
