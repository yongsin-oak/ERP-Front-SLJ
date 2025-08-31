/* eslint-disable @typescript-eslint/no-explicit-any */
import { PaginationDataQuery, Timestamped } from "@interfaces/common";

export interface ProductBrandProps {
  id: string;
  name: string;
}
export type ProductCategoryProps = ProductBrandProps;

export interface ProductPrice {
  pack: number;
  carton: number;
}
export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
}

export interface ProductData extends Timestamped {
  barcode: string;
  name: string;
  costPrice: ProductPrice | null;
  sellPrice: ProductPrice | null;
  remaining: number;
  minStock: number | null;
  productDimensions: ProductDimensions | null;
  cartonDimensions: ProductDimensions | null;
  piecesPerPack: number | null;
  packPerCarton: number | null;
  brand: ProductBrandProps | null;
  category: ProductCategoryProps | null;
  [key: string]: any;
}

export interface onGetProductsProps extends PaginationDataQuery {
  setData?:
    | React.Dispatch<React.SetStateAction<ProductData[] | undefined>>
    | ((data: ProductData[]) => void);
}

export interface FormProductData
  extends Omit<ProductData, "createdAt" | "updatedAt" | "brand" | "category"> {
  brandId: string | null;
  categoryId: string | null;
  unit: {
    cartonWeight: string;
    minStock: string;
    productWeight: string;
    remaining: string;
  };
}
export interface onUploadProductsProps {
  data: FormProductData;
  final?: () => void;
}
