import { create } from "zustand";
import { ProductData, FormProductData } from "../interface/interface";
import {
  onGetProducts,
  onDeleteProduct,
  onBulkDeleteProducts,
  onUpdateProductFromForm,
} from "../hooks/product.hook";

export interface FilterState {
  priceRange: [number, number];
  stockLevel: "all" | "low" | "out" | "normal";
  brands: string[];
  categories: string[];
}

type SortField = "barcode" | "name" | "remaining" | "brand" | "category";
type SortOrder = "asc" | "desc";
type ViewMode = "table" | "card";

interface ProductStockState {
  // Data
  data: ProductData[] | undefined;
  loading: boolean;

  // UI State
  searchTerm: string;
  selectedItems: string[];
  sortField: SortField;
  sortOrder: SortOrder;
  viewMode: ViewMode;

  // Modals
  uploadModalOpen: boolean;
  editModalOpen: boolean;
  advancedFilterModalOpen: boolean;
  detailDrawerOpen: boolean;
  selectedProduct: ProductData | null;
  editingProduct: ProductData | null;

  // Filters
  filters: FilterState;
}

interface ProductStockActions {
  // Data actions
  loadProducts: () => Promise<void>;
  setData: (data: ProductData[] | undefined) => void;

  // UI actions
  setSearchTerm: (term: string) => void;
  setSelectedItems: (items: string[]) => void;
  addSelectedItem: (barcode: string) => void;
  removeSelectedItem: (barcode: string) => void;
  clearSelectedItems: () => void;
  selectAllItems: (items: ProductData[]) => void;
  selectAll: (barcodes: string[]) => void;
  selectItem: (barcode: string, checked: boolean) => void;

  // Sort and filter actions
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setViewMode: (mode: ViewMode) => void;
  setFilters: (filters: FilterState) => void;
  resetFilters: () => void;

  // Modal actions
  openUploadModal: () => void;
  closeUploadModal: () => void;
  openEditModal: (product: ProductData) => void;
  closeEditModal: () => void;
  openAdvancedFilterModal: () => void;
  closeAdvancedFilterModal: () => void;
  openDetailDrawer: (product: ProductData) => void;
  closeDetailDrawer: () => void;

  // Product actions
  deleteProducts: (barcodes: string[]) => Promise<void>;
  updateSingleProduct: (
    barcode: string,
    values: FormProductData
  ) => Promise<void>;
}

const initialFilters: FilterState = {
  priceRange: [0, 100000],
  stockLevel: "all",
  brands: [],
  categories: [],
};

export const useProductStore = create<ProductStockState & ProductStockActions>(
  (set, get) => ({
    // Initial state
    data: undefined,
    loading: false,
    searchTerm: "",
    selectedItems: [],
    sortField: "name",
    sortOrder: "asc",
    viewMode:
      (localStorage.getItem("product-stock-view-mode") as ViewMode) || "table",
    uploadModalOpen: false,
    editModalOpen: false,
    advancedFilterModalOpen: false,
    detailDrawerOpen: false,
    selectedProduct: null,
    editingProduct: null,
    filters: initialFilters,

    // Data actions
    loadProducts: async () => {
      set({ loading: true });
      try {
        const data = await onGetProducts({});
        set({ data });
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        set({ loading: false });
      }
    },

    setData: (data) => set({ data }),

    // UI actions
    setSearchTerm: (searchTerm) => set({ searchTerm }),

    setSelectedItems: (selectedItems) => set({ selectedItems }),

    addSelectedItem: (barcode) => {
      const { selectedItems } = get();
      if (!selectedItems.includes(barcode)) {
        set({ selectedItems: [...selectedItems, barcode] });
      }
    },

    removeSelectedItem: (barcode) => {
      const { selectedItems } = get();
      set({ selectedItems: selectedItems.filter((item) => item !== barcode) });
    },

    clearSelectedItems: () => set({ selectedItems: [] }),

    selectAllItems: (items) => {
      set({ selectedItems: items.map((item) => item.barcode) });
    },

    selectAll: (barcodes) => {
      set({ selectedItems: barcodes });
    },

    selectItem: (barcode, checked) => {
      const { selectedItems } = get();
      if (checked) {
        if (!selectedItems.includes(barcode)) {
          set({ selectedItems: [...selectedItems, barcode] });
        }
      } else {
        set({
          selectedItems: selectedItems.filter((item) => item !== barcode),
        });
      }
    },

    // Sort and filter actions
    setSortField: (sortField) => set({ sortField }),
    setSortOrder: (sortOrder) => set({ sortOrder }),

    setViewMode: (viewMode) => {
      localStorage.setItem("product-stock-view-mode", viewMode);
      set({ viewMode });
    },

    setFilters: (filters) => set({ filters }),
    resetFilters: () => set({ filters: initialFilters }),

    // Modal actions
    openUploadModal: () => set({ uploadModalOpen: true }),
    closeUploadModal: () => set({ uploadModalOpen: false }),
    openEditModal: (product) =>
      set({
        editModalOpen: true,
        editingProduct: product,
      }),
    closeEditModal: () =>
      set({
        editModalOpen: false,
        editingProduct: null,
      }),
    openAdvancedFilterModal: () => set({ advancedFilterModalOpen: true }),
    closeAdvancedFilterModal: () => set({ advancedFilterModalOpen: false }),

    openDetailDrawer: (product) =>
      set({
        selectedProduct: product,
        detailDrawerOpen: true,
      }),
    closeDetailDrawer: () =>
      set({
        detailDrawerOpen: false,
        selectedProduct: null,
      }),

    // Product actions
    deleteProducts: async (barcodes) => {
      try {
        if (barcodes.length === 1) {
          await onDeleteProduct(barcodes[0]);
        } else {
          await onBulkDeleteProducts(barcodes);
        }

        // Refresh data and clear selection
        await get().loadProducts();
        set({ selectedItems: [] });
      } catch (error) {
        console.error("Delete error:", error);
        throw error;
      }
    },

    updateSingleProduct: async (barcode, values) => {
      try {
        await onUpdateProductFromForm(barcode, values);

        // Refresh data and close edit modal
        await get().loadProducts();
        set({ editModalOpen: false, editingProduct: null });
      } catch (error) {
        console.error("Update single product error:", error);
        throw error;
      }
    },
  })
);
