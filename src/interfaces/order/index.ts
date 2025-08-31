import { Timestamped } from "@interfaces/common";
import { EmployeeType } from "@interfaces/exployee";

export interface OrderType extends Timestamped {
  id: string;
  totalCostPrice: number;
  totalCurrentPrice: number;
  totalQuantity: number;
  employee: EmployeeType;
  shop: ShopType;
  orderDetails: OrderDetailType[];
}

export interface ShopType extends Timestamped {
  id: string;
  name: string;
  description: string;
  platform: string;
}

export interface OrderDetailType extends Timestamped {
  id: string;
  productBarcode: string;
  orderId: string;
  quantity: number;
}

export interface onPostOrderType
  extends Omit<
    OrderType,
    | "totalCostPrice"
    | "totalCurrentPrice"
    | "totalQuantity"
    | "createdAt"
    | "updatedAt"
    | "employee"
    | "shop"
    | "orderDetails"
  > {
  employeeId: string;
  shopId: string;
  orderDetails: {
    productBarcode: string;
    quantity: number;
  }[];
}
