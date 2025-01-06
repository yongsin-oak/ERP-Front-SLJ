import { DefaultOptionType } from "antd/es/select";
import ShopeeIcon from "../../../assets/icon/platform/Shopee";
import LazadaIcon from "../../../assets/icon/platform/Lazada";
import { TikTokFilled } from "@ant-design/icons";

export interface Options extends DefaultOptionType {
  icon?: React.ReactNode;
}
export const platform: Options[] = [
  {
    label: "Lazada",
    value: "Lazada",
    icon: <LazadaIcon width={14} />,
  },
  {
    label: "Shopee",
    value: "Shopee",
    icon: <ShopeeIcon width={14} />,
  },
  {
    label: "Tiktok",
    value: "Tiktok",
    icon: <TikTokFilled />,
  },
];
export const allShop: Options[] = [
  {
    label: "ทรัพย์ล้นใจ",
    value: "slj1",
  },
  {
    label: "เจ้าสัวบรรจุภัณฑ์",
    value: "slj2",
  },
  {
    label: "Super-A",
    value: "slj3",
  },
  {
    label: "สมหวังบรรจุภัณฑ์",
    value: "slj4",
  },
];

export const tiktokShop: Options[] = [
  {
    label: "ทรัพย์ล้นใจ",
    value: "slj1",
  },
  {
    label: "เจ้าสัวบรรจุภัณฑ์",
    value: "slj2",
  },
];
