import { Layout, Menu, Button, Drawer } from "antd";
import Sider from "antd/es/layout/Sider";
import { CSSProperties, useState } from "react";
import {
  LeftOutlined,
  MoonFilled,
  RightOutlined,
  SunFilled,
  MenuOutlined,
} from "@ant-design/icons";
import { Content } from "antd/es/layout/layout";
import { Outlet, useNavigate } from "react-router-dom";
import { HeadSider, StickyButton } from "./styles";
import { useStoreTheme } from "../store";
import { useTheme } from "@emotion/react";
import { menuItems } from "./menu";
import { isMobile } from "../utils/responsive";
import { useWindowSize } from "@uidotdev/usehooks";

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const { setTheme, themeMode } = useStoreTheme();
  const theme = useTheme();
  const isDark = themeMode === "dark";
  const iconSize = collapsed ? 18 : 16;
  const navigate = useNavigate();
  const { width: windowWidth } = useWindowSize();
  const mobileSize = windowWidth && isMobile(windowWidth);

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

  const SwitchThemeButton = () => {
    return isDark ? (
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
    );
  };
  return (
    <Layout
      hasSider
      style={{
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {!mobileSize && (
        <Sider
          collapsible
          collapsed={collapsed}
          width={200}
          trigger={
            <div
              style={{
                borderInlineEnd: `1px solid ${theme.splitLine_}`,
              }}
            >
              {collapsed ? <RightOutlined /> : <LeftOutlined />}
            </div>
          }
          collapsedWidth={80}
          onCollapse={(collapsed) => {
            setCollapsed(collapsed);
          }}
          theme={themeMode}
          style={siderStyles}
        >
          <HeadSider justifyContent={collapsed ? "center" : "start"}>
            <SwitchThemeButton />
          </HeadSider>
          <Menu
            theme={themeMode}
            mode="inline"
            defaultSelectedKeys={["1"]}
            items={menuItems(navigate)}
            style={{ borderInlineEnd: "none" }}
          />
        </Sider>
      )}

      {mobileSize && (
        <>
          <Drawer
            open={showDrawer}
            onClose={() => setShowDrawer(false)}
            placement="left"
            styles={{ body: { padding: 0 } }}
          >
            <HeadSider justifyContent="start" style={{ height: 24 }}>
              <SwitchThemeButton />
            </HeadSider>
            <Menu
              theme={themeMode}
              mode="inline"
              defaultSelectedKeys={["1"]}
              items={menuItems(navigate)}
              style={{ borderInlineEnd: "none" }}
            />
          </Drawer>
        </>
      )}

      <Layout>
        <StickyButton theme={theme}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setShowDrawer(true)}
            style={{ display: mobileSize ? "inline-block" : "none" }}
          />
        </StickyButton>
        <Content
          style={{
            padding: mobileSize ? 16 : 32,
            overflow: "auto",
            marginInlineStart: mobileSize ? 0 : collapsed ? 80 : 200,
            backgroundColor: theme.background_,
          }}
        >
          <Outlet></Outlet>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
