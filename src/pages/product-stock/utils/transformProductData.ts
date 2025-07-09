import { convertUnit } from "../../../utils/convertUnit";
import { FormProductData, ProductData } from "../interface/interface";

/**
 * แปลง FormProductData เป็น ProductData format สำหรับส่งไปยัง API
 * ใช้ logic เดียวกับ onUploadProducts
 */
export const transformFormToProductData = (
  formData: FormProductData
): Partial<ProductData> => {
  const {
    costPrice,
    sellPrice,
    cartonDimensions,
    packPerCarton,
    productDimensions,
    remaining,
    minStock,
    piecesPerPack,
    unit,
    ...rest
  } = formData;

  // แปลงน้ำหนักสินค้าจาก kg เป็น g ถ้าจำเป็น
  const pWeight =
    unit?.productWeight === "kg"
      ? convertUnit(productDimensions?.weight ?? 0, "kg", "g")
      : productDimensions?.weight;

  // แปลงน้ำหนักกล่องจาก kg เป็น g ถ้าจำเป็น
  const cWeight =
    unit?.cartonWeight === "kg"
      ? convertUnit(cartonDimensions?.weight ?? 0, "kg", "g")
      : cartonDimensions?.weight;

  // แปลงจำนวนคงเหลือจาก carton เป็น pack ถ้าจำเป็น
  const packRemaining =
    unit?.remaining === "carton" ? remaining * (packPerCarton || 1) : remaining;

  // แปลง minimum stock จาก carton เป็น pack ถ้าจำเป็น
  const packMinStock =
    unit?.minStock === "carton"
      ? (minStock || 0) * (packPerCarton || 1)
      : minStock;

  return {
    ...rest,
    costPrice: {
      pack: Number(costPrice?.pack),
      carton: Number(costPrice?.carton),
    },
    sellPrice: {
      pack: Number(sellPrice?.pack),
      carton: Number(sellPrice?.carton),
    },
    productDimensions: {
      length: Number(productDimensions?.length),
      width: Number(productDimensions?.width),
      height: Number(productDimensions?.height),
      weight: Number(pWeight),
    },
    cartonDimensions: {
      length: Number(cartonDimensions?.length),
      width: Number(cartonDimensions?.width),
      height: Number(cartonDimensions?.height),
      weight: Number(cWeight),
    },
    piecesPerPack: Number(piecesPerPack),
    packPerCarton: Number(packPerCarton),
    remaining: Number(packRemaining),
    minStock: Number(packMinStock),
  };
};
