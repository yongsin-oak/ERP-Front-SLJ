import { onPostOrderType, OrderType } from "@types";
import req from "@lib/config/req";
import { create } from "zustand";

interface OrderState {
  onPostOrder: (orderData: onPostOrderType) => Promise<OrderType>;
}
export const useOrderStore = create<OrderState>(() => ({
  onPostOrder: async (orderData) => {
    try {
      const response = await req.post("/order", orderData);
      return response.data;
    } catch (error) {
      console.error("Error posting order:", error);
      throw error;
    }
  },
}));
