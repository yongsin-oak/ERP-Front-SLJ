import { EmployeeType } from "../_employee/employee.interface";

export interface OrderType {
  id: string;
  totalCostPrice: number;
  totalCurrentPrice: number;
  totalQuantity: number;
  employee: EmployeeType;
  shop: ShopType;
  createdAt: string;
  updatedAt: string;
  orderDetails: OrderDetailType[];
}

export interface ShopType {
  id: number;
  name: string;
  description: string;
  platform: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetailType {
  id: string;
  productBarcode: string;
  orderId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}
