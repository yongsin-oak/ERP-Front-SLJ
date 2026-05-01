import type { Platform } from '@features/shop';

/**
 * NOTE: API ปัจจุบันยังไม่รองรับ status / orderNumber / note ใน /order
 * fields เหล่านี้เก็บไว้ฝั่ง FE เพื่อ UX และส่งไปใน body
 * ถ้า backend ใส่ whitelist validator → field พิเศษจะถูก ignore (หรือ 400)
 * ดู .claude/API.md → ควรเพิ่ม fields เหล่านี้ที่ backend
 */
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';

export const OrderStatusLabel: Record<OrderStatus, string> = {
  pending: 'รอดำเนินการ',
  confirmed: 'ยืนยันแล้ว',
  shipped: 'จัดส่งแล้ว',
  completed: 'สำเร็จ',
  cancelled: 'ยกเลิก',
};

export const OrderStatusColor: Record<OrderStatus, string> = {
  pending: 'orange',
  confirmed: 'blue',
  shipped: 'cyan',
  completed: 'green',
  cancelled: 'red',
};

/** Row ใน OrderItemsEditor — UI representation */
export interface OrderItem {
  barcode: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number; // เก็บเป็น quantityPack ตอน submit
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
  orderNumber?: string;
  status?: OrderStatus;
  note?: string;
  employee?: { id: string; firstName: string; lastName: string; nickname: string };
  shop?: { id: string; name: string; platform: Platform };
  orderDetails?: OrderDetail[];
  createdAt?: string;
  updatedAt?: string;
}

/** API POST body (ตาม .claude/API.md) */
export interface CreateOrderDto {
  createdBy: string;
  shopId: string;
  details: { productBarcode: string; quantityPack: number; quantityCarton: number }[];
  /** UI extension — ขึ้นอยู่กับ backend ว่ารับหรือไม่ */
  orderNumber?: string;
  note?: string;
}

export type UpdateOrderDto = Partial<CreateOrderDto>;
