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

export interface ProductData {
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
  createdAt: string;
  updatedAt: string;
  brand: ProductBrandProps | null;
  category: ProductCategoryProps | null;
}

export interface onGetProductsProps {
  setData?: React.Dispatch<React.SetStateAction<ProductData[] | undefined>>;
  page?: number;
  limit?: number;
}

export interface FormProductData extends ProductData {
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
