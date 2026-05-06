import type { Platform } from '@features/shop';

export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export const OrderStatusLabel: Record<OrderStatus, string> = {
  pending: 'รอดำเนินการ',
  completed: 'สำเร็จ',
  cancelled: 'ยกเลิก',
};

export const OrderStatusColor: Record<OrderStatus, string> = {
  pending: 'orange',
  completed: 'green',
  cancelled: 'red',
};

/** Row ใน OrderItemsEditor — UI representation */
export interface OrderItem {
  barcode: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
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
  orderDetails?: OrderDetail[];
  createdAt?: string;
  updatedAt?: string;
}

/** API POST body */
export interface CreateOrderDto {
  recordBy: string;
  shopId: string;
  terminalId?: string;
  status?: OrderStatus;
  startRecordAt?: string;
  completedRecordAt?: string;
  note?: string;
  details: { productBarcode: string; quantityPack: number; quantityCarton: number }[];
}

export type UpdateOrderDto = Partial<Omit<CreateOrderDto, 'recordBy'>>;
