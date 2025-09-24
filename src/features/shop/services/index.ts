import {
  PaginationDataQuery,
  PaginationDataResponse,
} from "@interfaces/common";
import { Shop } from "@interfaces/shop";
import { ShopCreateDto } from "../types";
import req from "@utils/common/req";

// สร้าง shop
export const createShop = async (data: ShopCreateDto): Promise<Shop> => {
  const res = await req.post("/shop", data);
  return res.data;
};

// ดึง shop แบบ paginated
export const getAllShops = async (
  params: PaginationDataQuery
): Promise<PaginationDataResponse<Shop>> => {
  const res = await req.get("/shop", { params });
  return res.data;
};

// ดึง shop เดี่ยว
export const getShopById = async (id: string): Promise<Shop> => {
  const res = await req.get(`/shop/${id}`);
  return res.data;
};

// อัปเดต shop
export const updateShop = async (
  id: string,
  data: ShopCreateDto
): Promise<Shop> => {
  const res = await req.patch(`/shop/${id}`, data);
  return res.data;
};

// ลบ shop
export const deleteShop = async (id: string): Promise<Shop> => {
  const res = await req.delete(`/shop/${id}`);
  return res.data;
};
