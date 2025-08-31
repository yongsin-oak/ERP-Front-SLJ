import { DefaultOptionType } from "antd/es/select";
import ShopeeIcon from "@assets/icon/platform/Shopee";
import LazadaIcon from "@assets/icon/platform/Lazada";
import { TikTokFilled } from "@ant-design/icons";

export interface Options extends DefaultOptionType {
  icon?: React.ReactNode;
  color?: string;
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
    value: "SupLonJai",
  },
  {
    label: "เจ้าสัวบรรจุภัณฑ์",
    value: "JaoSua",
  },
  {
    label: "Super-A",
    value: "SuperA",
  },
  {
    label: "สมหวังบรรจุภัณฑ์",
    value: "SomWang",
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
