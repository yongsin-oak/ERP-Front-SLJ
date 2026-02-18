import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Platform } from "@features/shop/enums/Platform.enum";

// Types สำหรับ form fields
export interface OrderFormData {
  employee?: {
    id?: number;
    label?: string;
  };
  platform?: Platform;
  shop?: {
    id?: string;
    label?: string;
  };
  orderNumber?: string;
}

// Types สำหรับ loading states
export interface LoadingStates {
  save: boolean;
  get: boolean;
  checkOrder: boolean;
  loadEmployees: boolean;
  loadShops: boolean;
}

// Types สำหรับ error states
export interface ErrorStates {
  employee?: string;
  platform?: string;
  shop?: string;
  orderNumber?: string;
  general?: string;
}

// Interface สำหรับ order form store
export interface OrderFormStore {
  // Form data
  form: OrderFormData;

  // Loading states
  loading: LoadingStates;

  // Error states
  error: ErrorStates;

  // UI states
  recording: boolean;
  currentOrderNumber?: string;

  // Form actions
  setEmployee: (id: number | undefined, label?: string) => void;
  setPlatform: (platform: Platform | undefined) => void;
  setShop: (id: string | undefined, label?: string) => void;
  setOrderNumber: (orderNumber: string | undefined) => void;
  setFormData: (data: Partial<OrderFormData>) => void;

  // Loading actions
  setLoading: (key: keyof LoadingStates, value: boolean) => void;
  setMultipleLoading: (updates: Partial<LoadingStates>) => void;

  // Error actions
  setError: (key: keyof ErrorStates, value: string | undefined) => void;
  setMultipleErrors: (errors: Partial<ErrorStates>) => void;
  clearError: (key: keyof ErrorStates) => void;
  clearAllErrors: () => void;

  // UI actions
  setRecording: (recording: boolean) => void;
  setCurrentOrderNumber: (orderNumber: string | undefined) => void;

  // Reset functions
  resetForm: () => void;
  resetShop: () => void;
  resetOrderNumber: () => void;
  clearAll: () => void;
}

// Initial states
const initialFormData: OrderFormData = {
  employee: undefined,
  platform: undefined,
  shop: undefined,
  orderNumber: undefined,
};

const initialLoadingStates: LoadingStates = {
  save: false,
  get: false,
  checkOrder: false,
  loadEmployees: false,
  loadShops: false,
};

const initialErrorStates: ErrorStates = {
  employee: undefined,
  platform: undefined,
  shop: undefined,
  orderNumber: undefined,
  general: undefined,
};

// Create zustand store with session storage persistence
export const useOrderFormStore = create<OrderFormStore>()(
  persist(
    (set, get) => ({
      // Initial state
      form: initialFormData,
      loading: initialLoadingStates,
      error: initialErrorStates,
      recording: false,
      currentOrderNumber: undefined,

      // Form setters
      setEmployee: (id, label) => {
        set((state) => ({
          form: {
            ...state.form,
            employee: id !== undefined ? { id, label } : undefined,
            // เมื่อเปลี่ยน employee ให้ reset platform และอื่นๆ ถ้าเคลียร์
            platform: !id ? undefined : state.form.platform,
            shop: !id ? undefined : state.form.shop,
            orderNumber: !id ? undefined : state.form.orderNumber,
          },
          error: {
            ...state.error,
            employee: undefined, // Clear error when value changes
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
            shop: platform !== currentPlatform ? undefined : state.form.shop,
            orderNumber:
              platform !== currentPlatform ? undefined : state.form.orderNumber,
          },
          error: {
            ...state.error,
            platform: undefined,
            // Clear shop and orderNumber errors if platform changes
            ...(platform !== currentPlatform && {
              shop: undefined,
              orderNumber: undefined,
            }),
          },
        }));
      },

      setShop: (id, label) => {
        const currentShopId = get().form.shop?.id;
        set((state) => ({
          form: {
            ...state.form,
            shop: id !== undefined ? { id, label } : undefined,
            // เมื่อเปลี่ยน shop ให้ reset order number
            orderNumber:
              id !== currentShopId ? undefined : state.form.orderNumber,
          },
          error: {
            ...state.error,
            shop: undefined,
            // Clear orderNumber error if shop changes
            ...(id !== currentShopId && { orderNumber: undefined }),
          },
        }));
      },

      setOrderNumber: (orderNumber) =>
        set((state) => ({
          form: {
            ...state.form,
            orderNumber,
          },
          error: {
            ...state.error,
            orderNumber: undefined,
          },
        })),

      setFormData: (data) =>
        set((state) => ({
          form: {
            ...state.form,
            ...data,
          },
        })),

      // Loading actions
      setLoading: (key, value) =>
        set((state) => ({
          loading: {
            ...state.loading,
            [key]: value,
          },
        })),

      setMultipleLoading: (updates) =>
        set((state) => ({
          loading: {
            ...state.loading,
            ...updates,
          },
        })),

      // Error actions
      setError: (key, value) =>
        set((state) => ({
          error: {
            ...state.error,
            [key]: value,
          },
        })),

      setMultipleErrors: (errors) =>
        set((state) => ({
          error: {
            ...state.error,
            ...errors,
          },
        })),

      clearError: (key) =>
        set((state) => ({
          error: {
            ...state.error,
            [key]: undefined,
          },
        })),

      clearAllErrors: () =>
        set({
          error: initialErrorStates,
        }),

      // UI state setters
      setRecording: (recording) =>
        set({
          recording,
        }),

      setCurrentOrderNumber: (currentOrderNumber) =>
        set({
          currentOrderNumber,
        }),

      // Reset functions
      resetForm: () =>
        set({
          form: initialFormData,
          loading: initialLoadingStates,
          error: initialErrorStates,
          recording: false,
          currentOrderNumber: undefined,
        }),

      resetShop: () =>
        set((state) => ({
          form: {
            ...state.form,
            shop: undefined,
            orderNumber: undefined,
          },
          error: {
            ...state.error,
            shop: undefined,
            orderNumber: undefined,
          },
        })),

      resetOrderNumber: () =>
        set((state) => ({
          form: {
            ...state.form,
            orderNumber: undefined,
          },
          error: {
            ...state.error,
            orderNumber: undefined,
          },
        })),

      clearAll: () =>
        set({
          form: initialFormData,
          loading: initialLoadingStates,
          error: initialErrorStates,
          recording: false,
          currentOrderNumber: undefined,
        }),
    }),
    {
      name: "order-form-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        // Persist เฉพาะ form data และ UI state
        form: state.form,
        recording: state.recording,
        currentOrderNumber: state.currentOrderNumber,
      }),
    }
  )
);
