import { Layout, Menu, MenuProps } from "antd";
import Sider from "antd/es/layout/Sider";
import { CSSProperties, useState } from "react";
import {
  HomeOutlined,
  LeftOutlined,
  MoonFilled,
  RightOutlined,
  ScanOutlined,
  SunFilled,
  TableOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import { Content } from "antd/es/layout/layout";
import { Outlet, useNavigate } from "react-router-dom";
import { HeadSider } from "./styles";
import { useStoreTheme } from "../store";
import { useTheme } from "@emotion/react";

const Mainlayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { setTheme, themeMode } = useStoreTheme();
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = themeMode === "dark";
  const iconSize = collapsed ? 18 : 16;
  const menuItems: MenuProps["items"] = [
    {
      key: "1",
      icon: <HomeOutlined />,
      label: "หน้าหลัก",
      onClick: () => navigate("/"),
    },
    {
      key: "2",
      icon: <ScanOutlined />,
      label: "สแกนสินค้า",
      onClick: () => navigate("/scan"),
    },
    {
      key: "3",
      icon: <TruckOutlined />,
      label: "การขนส่ง",
      onClick: () => navigate("/transport"),
    },
    {
      key: "4",
      icon: <TableOutlined />, //<ProductOutlined />
      label: "สต๊อกสินค้า",
      onClick: () => navigate("/product-stock"),
    },
  ];
  const siderStyles: CSSProperties = {
    overflow: "auto",
    height: "100vh",
    top: 0,
    bottom: 0,
    insetInlineStart: 0,
    scrollbarWidth: "thin",
    position: "fixed",
    borderInlineEnd: `1px solid ${theme.splitLine_}`,
  };
  const trigger: React.ReactNode = collapsed ? (
    <div
      style={{
        borderInlineEnd: `1px solid ${theme.splitLine_}`,
      }}
    >
      <RightOutlined />
    </div>
  ) : (
    <div
      style={{
        borderInlineEnd: `1px solid ${theme.splitLine_}`,
      }}
    >
      <LeftOutlined />
    </div>
  );
  return (
    <Layout
      hasSider
      style={{
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <Sider
        collapsible
        collapsed={collapsed}
        width={200}
        trigger={trigger}
        collapsedWidth={80}
        onCollapse={(collapsed) => {
          setCollapsed(collapsed);
        }}
        theme={themeMode}
        style={siderStyles}
      >
        <HeadSider justifyContent={collapsed ? "center" : "start"}>
          {isDark ? (
            <MoonFilled
              style={{
                fontSize: iconSize,
                transition: "font-size .2s",
                color: "white",
              }}
              onClick={() => setTheme("light")}
            />
          ) : (
            <SunFilled
              style={{ fontSize: iconSize, transition: "font-size .2s" }}
              onClick={() => setTheme("dark")}
            />
          )}
        </HeadSider>
        <Menu
          theme={themeMode}
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={menuItems}
          style={{ borderInlineEnd: "none" }}
        />
      </Sider>
      <Layout
        style={{
          overflow: "auto",
          marginInlineStart: collapsed ? 80 : 200,
          backgroundColor: theme.background_,
          padding: "16px",
        }}
      >
        <Content>
          <Outlet></Outlet>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Mainlayout;
