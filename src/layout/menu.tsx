import { MenuProps } from "antd";
import {
  BankOutlined,
  CommentOutlined,
  HomeOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  TableOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import DeliveryIcon from "../assets/icon/menu/delivery";
import { NavigateFunction } from "react-router-dom";

export const menuItems = (navigate: NavigateFunction): MenuProps["items"] => {
  return [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: "หน้าหลัก",
      onClick: () => navigate("/"),
    },
    {
      key: "sell",
      icon: <ShoppingCartOutlined />,
      label: "การขาย",
      children: [
        {
          key: "sell/pos",
          label: "หน้าร้าน",
          icon: <ShopOutlined />,
          onClick: () => navigate("/sell-pos"),
        },
        {
          key: "sell/online",
          label: "ขายโดยตรง",
          icon: <CommentOutlined />,
          onClick: () => navigate("/sell-online"),
        },
        {
          key: "sell/delivery",
          label: "เดลิเวอรี่",
          icon: <DeliveryIcon />,
          onClick: () => navigate("/sell-delivery"),
        },
        {
          key: "sell/ecommerce",
          label: "อีคอมเมิร์ซ",
          icon: <ShoppingOutlined />,
          onClick: () => navigate("/sell-ecommerce"),
        },
      ],
    },
    {
      key: "stock",
      icon: <TableOutlined />, //<ProductOutlined />
      label: "สต๊อกสินค้า",
      onClick: () => navigate("/product-stock"),
    },
    {
      key: "employee",
      icon: <TeamOutlined />,
      label: "พนักงาน",
      onClick: () => navigate("/employee"),
    },
    {
      key: "finance",
      icon: <BankOutlined />,
      label: "การเงิน",
      onClick: () => navigate("/finance"),
    },
    {
      key: "delivery",
      icon: <UserOutlined />,
      label: "ผู้ใช้งาน",
      onClick: () => navigate("/user"),
    },
  ];
};
