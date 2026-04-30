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

export interface OrderItem {
  productId?: string;
  barcode: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber?: string;
  status: OrderStatus;
  note?: string;
  employeeId?: string;
  employee?: { firstName: string; lastName: string; nickname: string };
  shopId?: string;
  shop?: { id: string; name: string; platform: string };
  items: OrderItem[];
  totalQuantity: number;
  totalCostPrice: number;
  totalSellingPrice: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderDto {
  status?: OrderStatus;
  note?: string;
  employeeId?: string;
  shopId?: string;
  items: { barcode: string; quantity: number }[];
}

export type UpdateOrderDto = Partial<CreateOrderDto>;
