import req from "@utils/common/req";
import {
  onGetProductsProps,
  onUploadProductsProps,
  ProductData,
  FormProductData,
} from "@interfaces/product";
import { transformFormToProductData } from "@utils/product/transformProductData";
import { PaginationDataResponse } from "@interfaces/common";

export const onGetProducts = async ({
  setData,
  page = 1,
  limit = 10,
}: onGetProductsProps): Promise<PaginationDataResponse<ProductData>> => {
  try {
    const res = await req.get("/products", {
      params: {
        page: page,
        limit: limit,
      },
    });
    setData?.(res.data.data);
    return res.data;
  } catch (error) {
    console.log(error);
    return { data: [], total: 0, page: 1, limit: 10 };
  }
};

// Single product operations
export const onGetProduct = async (barcode: string) => {
  try {
    const res = await req.get(`/products/${barcode}`);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const onUploadProducts = async ({
  data,
  final,
}: onUploadProductsProps) => {
  try {
    const transformedData = transformFormToProductData(data);
    const res = await req.post("/products", transformedData);
    console.log(res);
  } catch (error) {
    console.log(error);
  } finally {
    final?.();
  }
};

export const onUpdateProduct = async ({
  barcode,
  data,
  final,
}: {
  barcode: string;
  data: Partial<ProductData>;
  final?: () => void;
}) => {
  try {
    const res = await req.patch(`/products/${barcode}`, data);
    return res.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    final?.();
  }
};

export const onUpdateProductFromForm = async (
  barcode: string,
  formData: FormProductData
) => {
  try {
    const transformedData = transformFormToProductData(formData);
    const res = await req.patch(`/products/${barcode}`, transformedData);
    return res.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const onDeleteProduct = async (barcode: string) => {
  try {
    const res = await req.delete(`/products/${barcode}`);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Bulk operations
export const onBulkCreateProducts = async (products: FormProductData[]) => {
  try {
    const res = await req.post("/products/bulk", { products });
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const onBulkUpdateProducts = async (
  products: Partial<ProductData>[]
) => {
  try {
    const res = await req.patch("/products/bulk", { products });
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const onBulkDeleteProducts = async (barcodes: string[]) => {
  try {
    const res = await req.delete("/products/bulk", { data: { barcodes } });
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
