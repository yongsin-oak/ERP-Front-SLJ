import {
  PaginationDataResponse
} from "@interfaces/common";
import { onGetShopsType, Shop } from "@interfaces/index";
import req from "@utils/common/req";

export const onGetShops = async ({
  page,
  limit,
  platform,
}: onGetShopsType): Promise<PaginationDataResponse<Shop>> => {
  try {
    const res = await req.get("/shop", {
      params: {
        page: page,
        limit: limit,
        platform: platform,
      },
    });
    return res.data;
  } catch (error) {
    console.log(error);
    return { data: [], total: 0, page: 1, limit: 10 };
  }
};
