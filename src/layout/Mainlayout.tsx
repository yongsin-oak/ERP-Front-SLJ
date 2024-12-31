import { Button, Layout, Menu, MenuProps } from "antd";
import Sider from "antd/es/layout/Sider";
import React, { useState } from "react";
import {
  AppstoreOutlined,
  ArrowsAltOutlined,
  BarChartOutlined,
  CloudOutlined,
  SearchOutlined,
  ShopOutlined,
  ShrinkOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Content } from "antd/es/layout/layout";
import { Outlet } from "react-router-dom";
import styled from "@emotion/styled";

const Mainlayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const items: MenuProps["items"] = [
    UserOutlined,
    VideoCameraOutlined,
    UploadOutlined,
    BarChartOutlined,
    CloudOutlined,
    AppstoreOutlined,
    TeamOutlined,
    ShopOutlined,
  ].map((icon, index) => ({
    key: String(index + 1),
    icon: React.createElement(icon),
    label: `nav ${index + 1}`,
  }));
  const HeadSider = styled.div`
    width: calc(100% - 8px);
    margin-block: 4px;
    margin-inline: 4px;
    text-align: start;
    display: flex;
    padding: 8px;
    justify-content: ${collapsed ? "center" : "space-between"};
  `;
  const iconSize = 20;
  return (
    <Layout hasSider style={{ minHeight: "100vh", width: "100%" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={200}
        collapsedWidth={80}
        theme="light"
        style={{
          overflow: "auto",
          height: "100vh",
          top: 0,
          bottom: 0,
          insetInlineStart: 0,
          scrollbarWidth: "thin",
          position: "fixed",
        }}
      >
        <HeadSider>
          <ShrinkOutlined
            style={{ fontSize: iconSize, display: collapsed ? "none" : "flex" }}
            onClick={() => {
              setCollapsed(true);
            }}
          />
          <ArrowsAltOutlined
            style={{
              fontSize: iconSize,
              display: collapsed ? "flex" : "none",
              justifySelf: "center",
            }}
            onClick={() => {
              setCollapsed(false);
            }}
          />
          <SearchOutlined
            style={{ fontSize: iconSize, display: collapsed ? "none" : "flex" }}
          />
        </HeadSider>
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={items}
        />
      </Sider>
      <Layout
        style={{
          overflow: "auto",
          // width: collapsed ? "calc(100% - 80px)" : "calc(100vw - 200px)",
          marginInlineStart: collapsed ? 80 : 200,
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
