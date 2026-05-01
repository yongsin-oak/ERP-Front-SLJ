import { useState, useRef, useEffect } from 'react';
import { InputNumber, Space, AutoComplete, message } from 'antd';
import type { InputRef } from 'antd';
import {
  BarcodeOutlined,
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Input, Table, Tag } from '@design-system';
import type { ColumnType } from '@design-system';
import { inventoryService } from '@features/inventory/services';
import { getErrorMessage } from '@lib';
import type { OrderItem } from '../types';
import type { Product } from '@features/inventory/types';

interface OrderItemsEditorProps {
  items: OrderItem[];
  onChange: (items: OrderItem[]) => void;
  /** trigger when items get reset externally — to refocus barcode field */
  resetSignal?: number;
}

function getPrice(p: Product, key: 'sellPrice' | 'costPrice'): number {
  return p[key]?.pack ?? p[key]?.carton ?? 0;
}

export function OrderItemsEditor({ items, onChange, resetSignal }: OrderItemsEditorProps) {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [searchOptions, setSearchOptions] = useState<{ value: string; label: string; product: Product }[]>([]);
  const [searching, setSearching] = useState(false);
  const barcodeRef = useRef<InputRef>(null);

  useEffect(() => {
    if (resetSignal !== undefined) barcodeRef.current?.focus();
  }, [resetSignal]);

  const addItem = (product: Product, qty = 1) => {
    const existing = items.find((i) => i.barcode === product.barcode);
    if (existing) {
      onChange(
        items.map((i) =>
          i.barcode === product.barcode ? { ...i, quantity: i.quantity + qty } : i,
        ),
      );
    } else {
      onChange([
        ...items,
        {
          barcode: product.barcode,
          name: product.name,
          costPrice: getPrice(product, 'costPrice'),
          sellingPrice: getPrice(product, 'sellPrice'),
          quantity: qty,
        },
      ]);
    }
  };

  const handleBarcodeSubmit = async () => {
    const barcode = barcodeInput.trim();
    if (!barcode) return;
    try {
      const res = await inventoryService.getByBarcode(barcode);
      addItem(res.data.data);
      setBarcodeInput('');
      barcodeRef.current?.focus();
    } catch (err) {
      message.error(getErrorMessage(err, `ไม่พบสินค้า barcode: ${barcode}`));
      barcodeRef.current?.focus();
    }
  };

  const handleSearch = async (value: string) => {
    setSearchValue(value);
    if (value.length < 2) {
      setSearchOptions([]);
      return;
    }
    setSearching(true);
    try {
      // ใช้ /product/dropdown-search — light-weight, สูงสุด 50 รายการ
      const res = await inventoryService.dropdownSearch(value);
      setSearchOptions(
        res.data.data.map((p) => ({
          value: p.barcode,
          label: `${p.name} (${p.barcode})`,
          product: {
            barcode: p.barcode,
            name: p.name,
            remaining: p.remaining,
            sellPrice: p.sellPrice,
          } as Product,
        })),
      );
    } catch {
      // silent — UX ของ autocomplete
    } finally {
      setSearching(false);
    }
  };

  const updateQty = (barcode: string, qty: number) => {
    if (qty <= 0) {
      onChange(items.filter((i) => i.barcode !== barcode));
    } else {
      onChange(items.map((i) => (i.barcode === barcode ? { ...i, quantity: qty } : i)));
    }
  };

  const removeItem = (barcode: string) => {
    onChange(items.filter((i) => i.barcode !== barcode));
  };

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.sellingPrice * i.quantity, 0);

  const columns: ColumnType<OrderItem>[] = [
    {
      title: 'สินค้า',
      key: 'product',
      render: (_: unknown, record: OrderItem) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.name}</div>
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
      width: 130,
      align: 'center',
      render: (v: number, record: OrderItem) => (
        <InputNumber
          min={0}
          value={v}
          onChange={(val) => updateQty(record.barcode, val ?? 0)}
          style={{ width: 80 }}
          size="small"
        />
      ),
    },
    {
      title: 'รวม',
      key: 'total',
      width: 110,
      align: 'right',
      render: (_: unknown, record: OrderItem) => (
        <span style={{ fontWeight: 500 }}>
          ฿{(record.sellingPrice * record.quantity).toLocaleString()}
        </span>
      ),
    },
    {
      title: '',
      key: 'del',
      width: 48,
      render: (_: unknown, record: OrderItem) => (
        <Button
          variant="danger"
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.barcode)}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
        <div style={{ flex: '1 1 320px' }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            เพิ่มสินค้าด้วย Barcode
          </div>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              ref={barcodeRef}
              prefix={<BarcodeOutlined />}
              placeholder="สแกน หรือพิมพ์ barcode แล้วกด Enter"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onPressEnter={handleBarcodeSubmit}
            />
            <Button variant="primary" icon={<PlusOutlined />} onClick={handleBarcodeSubmit}>
              เพิ่ม
            </Button>
          </Space.Compact>
        </div>

        <div style={{ flex: '1 1 280px' }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            ค้นหาด้วยชื่อสินค้า
          </div>
          <AutoComplete
            value={searchValue}
            options={searchOptions}
            onSearch={handleSearch}
            onSelect={(_: string, option: { value: string; label: string; product: Product }) => {
              addItem(option.product);
              setSearchValue('');
              setSearchOptions([]);
              barcodeRef.current?.focus();
            }}
            style={{ width: '100%' }}
            notFoundContent={searching ? 'กำลังค้นหา...' : 'ไม่พบสินค้า'}
          >
            <Input prefix={<SearchOutlined />} placeholder="พิมพ์ชื่อสินค้าเพื่อค้นหา" />
          </AutoComplete>
        </div>
      </div>

      <Table<OrderItem>
        rowKey="barcode"
        columns={columns}
        dataSource={items}
        pagination={false}
        size="small"
        locale={{ emptyText: 'ยังไม่มีสินค้า — สแกน/พิมพ์ barcode หรือค้นหาด้านบน' }}
      />

      {items.length > 0 && (
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
          <span>
            จำนวนรวม: <Tag status="info">{totalQty} ชิ้น</Tag>
          </span>
          <span>
            ยอดรวม:{' '}
            <strong style={{ fontSize: 15 }}>฿{totalPrice.toLocaleString()}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
