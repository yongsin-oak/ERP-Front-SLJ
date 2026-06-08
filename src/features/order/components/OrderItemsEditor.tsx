import { useState, useRef, useEffect } from 'react';
import { InputNumber, Space, message } from 'antd';
import type { InputRef } from 'antd';
import {
  BarcodeOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Button, Input, Table, Tag } from '@design-system';
import type { ColumnType } from '@design-system';
import { inventoryService } from '@features/inventory/services';
import { ProductDropdownSelect } from '@features/inventory/components';
import { getErrorMessage } from '@shared';
import type { OrderItem } from '../types';
import type { ProductDropdown } from '@features/inventory/types';

interface OrderItemsEditorProps {
  items: OrderItem[];
  onChange: (items: OrderItem[]) => void;
  /** trigger when items get reset externally — to refocus barcode field */
  resetSignal?: number;
}

export function OrderItemsEditor({ items, onChange, resetSignal }: OrderItemsEditorProps) {
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeRef = useRef<InputRef>(null);

  useEffect(() => {
    if (resetSignal !== undefined) barcodeRef.current?.focus();
  }, [resetSignal]);

  const mergeItem = (barcode: string, name: string, sellingPrice: number, costPrice: number) => {
    const existing = items.find((i) => i.barcode === barcode);
    if (existing) {
      onChange(items.map((i) => (i.barcode === barcode ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      onChange([...items, { barcode, name, costPrice, sellingPrice, quantity: 1 }]);
    }
  };

  const handleBarcodeSubmit = async () => {
    const barcode = barcodeInput.trim();
    if (!barcode) return;
    try {
      const res = await inventoryService.getByBarcode(barcode);
      const p = res.data.data;
      mergeItem(
        p.barcode,
        p.name,
        p.sellPrice?.pack ?? p.sellPrice?.carton ?? 0,
        p.costPrice?.pack ?? p.costPrice?.carton ?? 0,
      );
      setBarcodeInput('');
      barcodeRef.current?.focus();
    } catch (err) {
      message.error(getErrorMessage(err, `ไม่พบสินค้า barcode: ${barcode}`));
      barcodeRef.current?.focus();
    }
  };

  const handleDropdownSelect = (_: string, product: ProductDropdown) => {
    mergeItem(
      product.barcode,
      product.name,
      product.sellPrice?.pack ?? product.sellPrice?.carton ?? 0,
      0, // cost price not available in dropdown-search lite shape
    );
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
          <ProductDropdownSelect
            style={{ width: '100%' }}
            placeholder="พิมพ์ชื่อหรือบาร์โค้ดเพื่อค้นหา"
            onSelect={handleDropdownSelect}
            value={undefined}
          />
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
