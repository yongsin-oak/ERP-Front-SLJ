import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Platform } from "@enums/Platform.enum";

// Types สำหรับ form data
export interface EmployeeData {
  id?: number;
  label?: string;
}

export interface ShopData {
  id?: string;
  label?: string;
}

export interface FormData {
  employee: EmployeeData;
  platform?: Platform;
  shop: ShopData;
  orderNumber?: string;
}

export interface UIState {
  recording: boolean;
  currentOrderNumber?: string;
}

// Interface สำหรับ ecommerce state
export interface EcommerceState {
  // Form data (grouped)
  form: FormData;

  // UI state (grouped)
  ui: UIState;

  // Actions
  setEmployee: (id: number | undefined, label?: string | undefined) => void;
  setPlatform: (platform: Platform | undefined) => void;
  setShop: (id: string | undefined, label?: string | undefined) => void;
  setOrderNumber: (orderNumber: string | undefined) => void;
  setRecording: (recording: boolean) => void;
  setCurrentOrderNumber: (orderNumber: string | undefined) => void;

  // Reset functions
  resetForm: () => void;
  resetShop: () => void;
  resetOrderNumber: () => void;
  clearAll: () => void;
}

// Initial state
const initialFormData: FormData = {
  employee: {},
  shop: {},
};

const initialUIState: UIState = {
  recording: false,
};

// Create zustand store with session storage persistence
export const useEcommerceStore = create<EcommerceState>()(
  persist(
    (set, get) => ({
      form: initialFormData,
      ui: initialUIState,

      // Form setters
      setEmployee: (id, label) => {
        set((state) => ({
          form: {
            ...state.form,
            employee: { id, label },
            // เมื่อเปลี่ยน employee ให้ reset platform และอื่นๆ
            platform: !id ? undefined : state.form.platform,
            shop: !id ? {} : state.form.shop,
            orderNumber: !id ? undefined : state.form.orderNumber,
          },
        }));
      },

      setPlatform: (platform) => {
        const currentPlatform = get().form.platform;
        set((state) => ({
          form: {
            ...state.form,
            platform,
            // เมื่อเปลี่ยน platform ให้ reset shop
            shop: platform !== currentPlatform ? {} : state.form.shop,
            orderNumber:
              platform !== currentPlatform ? undefined : state.form.orderNumber,
          },
        }));
      },

      setShop: (id, label) => {
        const currentShopId = get().form.shop.id;
        set((state) => ({
          form: {
            ...state.form,
            shop: { id, label },
            // เมื่อเปลี่ยน shop ให้ reset order number
            orderNumber:
              id !== currentShopId ? undefined : state.form.orderNumber,
          },
        }));
      },

      setOrderNumber: (orderNumber) =>
        set((state) => ({
          form: {
            ...state.form,
            orderNumber,
          },
        })),

      // UI state setters
      setRecording: (recording) =>
        set((state) => ({
          ui: {
            ...state.ui,
            recording,
          },
        })),

      setCurrentOrderNumber: (currentOrderNumber) =>
        set((state) => ({
          ui: {
            ...state.ui,
            currentOrderNumber,
          },
        })),

      // Reset functions
      resetForm: () =>
        set({
          form: initialFormData,
          ui: initialUIState,
        }),

      resetShop: () =>
        set((state) => ({
          form: {
            ...state.form,
            shop: {},
            orderNumber: undefined,
          },
        })),

      resetOrderNumber: () =>
        set((state) => ({
          form: {
            ...state.form,
            orderNumber: undefined,
          },
        })),

      clearAll: () =>
        set({
          form: initialFormData,
          ui: initialUIState,
        }),
    }),
    {
      name: "ecommerce-storage", // unique name
      storage: createJSONStorage(() => sessionStorage), // use session storage
      partialize: (state) => ({
        // เฉพาะ form data ที่ต้องการ persist (ไม่รวม ui state)
        form: state.form,
      }),
    }
  )
);
