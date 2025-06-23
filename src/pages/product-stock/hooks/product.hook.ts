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
    ...rest
  } = data;
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
        weight: Number(productDimensions?.weight),
      },
      cartonDimensions: {
        length: Number(cartonDimensions?.length),
        width: Number(cartonDimensions?.width),
        height: Number(cartonDimensions?.height),
        weight: Number(cartonDimensions?.weight),
      },
      piecesPerPack: Number(piecesPerPack),
      packPerCarton: Number(packPerCarton),
      remaining: Number(remaining),
      minStock: Number(minStock),
    });
    console.log(res);
  } catch (error) {
    console.log(error);
  } finally {
    final?.();
  }
};
