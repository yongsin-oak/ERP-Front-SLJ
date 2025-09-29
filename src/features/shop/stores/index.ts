import { create } from "zustand";
import {
  PaginationDataQuery,
  PaginationDataResponse,
} from "@interfaces/common";
import { Shop } from "@interfaces/shop";
import { ShopCreateDto } from "../types";
import {
  createShop,
  getAllShops,
  getShopById,
  updateShop,
  deleteShop,
} from "../services";
import { Platform } from "@features/shop/enums/Platform.enum";

export interface ShopListState {
  items: Shop[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error?: string;
}

export interface CurrentShopState {
  current?: Shop | null;
  currentLoading: boolean;
  currentError?: string;
}

export interface UpdateShopState {
  loadingUpdate: boolean;
  errorUpdate?: string;
}

export interface ShopActions {
  loadShops: (
    params?: PaginationDataQuery & { platform?: Platform }
  ) => Promise<PaginationDataResponse<Shop>>;
  loadShopById: (id: string) => Promise<Shop>;
  create: (data: ShopCreateDto) => Promise<Shop>;
  update: (id: string, data: ShopCreateDto) => Promise<Shop>;
  remove: (id: string) => Promise<Shop>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setItems: (items: Shop[]) => void;
  setCurrent: (shop: Shop | null) => void;
}

export type ShopStore = ShopListState &
  CurrentShopState &
  ShopActions &
  UpdateShopState;

const initialListState: ShopListState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: undefined,
};

const initialCurrentState: CurrentShopState = {
  current: null,
  currentLoading: false,
  currentError: undefined,
};

const updateState: UpdateShopState = {
  loadingUpdate: false,
  errorUpdate: undefined,
};

export const useShopStore = create<ShopStore>((set, get) => ({
  ...initialListState,
  ...initialCurrentState,
  ...updateState,

  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit }),
  setItems: (items) => set({ items }),
  setCurrent: (shop) => set({ current: shop }),

  loadShops: async (params) => {
    const { page, limit } = get();
    set({ loading: true, error: undefined });
    try {
      const res = await getAllShops({ page, limit, ...(params || {}) });
      console.log(res);
      set({
        items: res.data,
        total: res.total,
        page: res.page ?? page,
        limit: res.limit ?? limit,
      });
      return res;
    } catch (e: any) {
      const message = e?.message || "Failed to load shops";
      set({ error: message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  loadShopById: async (id) => {
    set({ currentLoading: true, currentError: undefined });
    try {
      const shop = await getShopById(id);
      set({ current: shop });
      return shop;
    } catch (e: any) {
      const message = e?.message || "Failed to load shop";
      set({ currentError: message });
      throw e;
    } finally {
      set({ currentLoading: false });
    }
  },

  create: async (data) => {
    set({ loadingUpdate: true, errorUpdate: undefined });
    try {
      const created = await createShop(data);
      // refresh first page quickly
      await get().loadShops({ page: 1 });
      return created;
    } catch (e: any) {
      const message = e?.message || "Failed to create shop";
      set({ errorUpdate: message });
      throw e;
    } finally {
      set({ loadingUpdate: false });
    }
  },

  update: async (id, data) => {
    set({ loadingUpdate: true, errorUpdate: undefined });
    try {
      const updated = await updateShop(id, data);
      // refresh list while keeping pagination
      await get().loadShops();
      // update current if it's the same
      const { current } = get();
      if (current && current.id === id) {
        set({ current: updated });
      }
      return updated;
    } catch (e: any) {
      const message = e?.message || "Failed to update shop";
      set({ errorUpdate: message });
      throw e;
    } finally {
      set({ loadingUpdate: false });
    }
  },

  remove: async (id) => {
    set({ loadingUpdate: true, errorUpdate: undefined });
    try {
      const removed = await deleteShop(id);
      // refresh list while keeping pagination
      await get().loadShops();
      // clear current if it's the same
      const { current } = get();
      if (current && current.id === id) {
        set({ current: null });
      }
      return removed;
    } catch (e: any) {
      const message = e?.message || "Failed to delete shop";
      set({ loadingUpdate: false, errorUpdate: message });
      throw e;
    } finally {
      set({ loadingUpdate: false });
    }
  },
}));
