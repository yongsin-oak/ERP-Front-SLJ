import req from "../../../utils/req";
import {
  onGetProductsProps,
  onUploadProductsProps,
  ProductData,
  FormProductData,
} from "../interface/interface";
import { transformFormToProductData } from "../utils/transformProductData";

export const onGetProducts = async ({
  setData,
  page = 1,
  limit = 10,
}: onGetProductsProps) => {
  try {
    const res = await req.get("/products", {
      params: {
        page: page,
        limit: limit,
      },
    });
    setData?.(res.data.data);
    return res.data.data;
  } catch (error) {
    console.log(error);
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

// Single product operations
export const onGetProduct = async (barcode: string) => {
  try {
    const res = await req.get(`/products/${barcode}`);
    return res.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const onUpdateProduct = async (
  barcode: string,
  data: Partial<ProductData>
) => {
  try {
    const res = await req.patch(`/products/${barcode}`, data);
    return res.data.data;
  } catch (error) {
    console.log(error);
    throw error;
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
