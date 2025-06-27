import { convertUnit } from "../../../utils/convertUnit";
import req from "../../../utils/req";
import {
  onGetProductsProps,
  onUploadProductsProps,
} from "../interface/interface";

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
  } = data;
  const pWeight =
    unit?.productWeight === "kg"
      ? convertUnit(productDimensions?.weight ?? 0, "kg", "g")
      : productDimensions?.weight;

  const cWeight =
    unit?.cartonWeight === "kg"
      ? convertUnit(cartonDimensions?.weight ?? 0, "kg", "g")
      : cartonDimensions?.weight;

  const packRemaining =
    unit?.remaining === "carton" ? remaining * (packPerCarton || 1) : remaining;

  const packMinStock =
    unit?.minStock === "carton"
      ? (minStock || 0) * (packPerCarton || 1)
      : minStock;
  try {
    const res = await req.post("/products", {
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
    });
    console.log(res);
  } catch (error) {
    console.log(error);
  } finally {
    final?.();
  }
};
