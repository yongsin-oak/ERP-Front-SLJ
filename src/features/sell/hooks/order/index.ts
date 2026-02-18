import { onPostOrderType } from "@types";
import req from "@lib/config/req";

export const onPostOrder = async (data: onPostOrderType) => {
  const { id, employeeId, shopId, orderDetails } = data;
  try {
    const res = await req.post("/order", {
      id,
      employeeId,
      shopId,
      orderDetails,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
