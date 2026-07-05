import type { Platform } from '@features/shop';

export const OrderStatuses = {
  completed: { label: 'สำเร็จ',  color: 'green' },
  cancelled: { label: 'ยกเลิก', color: 'red' },
} as const;

export type OrderStatus = keyof typeof OrderStatuses;

/** Row ใน OrderItemsEditor — UI representation */
export interface OrderItem {
  barcode: string;
  name: string;
  costPrice: number;
  /** ราคาขาย/แพ็ค */
  sellingPrice: number;
  /** ราคาขาย/ลัง — ใช้คำนวณยอดรวมเมื่อกรอกจำนวนลัง */
  sellPriceCarton?: number;
  /** จำนวนแพ็ค (default จากการสแกน) */
  quantity: number;
  /** จำนวนลัง */
  quantityCarton?: number;
}

/** API order detail (response) */
export interface OrderDetail {
  id: string;
  orderId: string;
  product: {
    barcode: string;
    name: string;
    sellPrice?: { pack?: number; carton?: number };
    costPrice?: { pack?: number; carton?: number };
  };
  quantityPack: number;
  quantityCarton: number;
  createdAt?: string;
  updatedAt?: string;
}

/** API order (response) */
export interface Order {
  id: string;
  recordBy: { id: string; firstName: string; lastName: string; nickname: string };
  terminal?: {
    id: string;
    terminalCode: string;
    name: string;
    role: string;
    location?: string;
    isActive: boolean;
  } | null;
  shop?: { id: string; name: string; platform: Platform };
  status: OrderStatus;
  startRecordAt?: string | null;
  completedRecordAt?: string | null;
  note?: string | null;
  orderNumber?: string | null;
  orderDetails?: OrderDetail[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * API POST body — `recordBy` (ผู้บันทึก) และ `terminalId` ถูก derive จาก actor token
 * (X-Actor-Token) ฝั่ง server เท่านั้น จึงไม่อยู่ใน payload
 */
export interface CreateOrderDto {
  shopId: string;
  orderNumber?: string;
  status?: OrderStatus;
  startRecordAt?: string;
  completedRecordAt?: string;
  note?: string;
  details: { productBarcode: string; quantityPack: number; quantityCarton: number }[];
}

export type UpdateOrderDto = Partial<CreateOrderDto>;
