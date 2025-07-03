import {
  LeftOutlined,
  MenuOutlined,
  MoonFilled,
  RightOutlined,
  SunFilled,
} from "@ant-design/icons";
import { useTheme } from "@emotion/react";
import { useWindowSize } from "@uidotdev/usehooks";
import { Drawer, Flex, Layout, Menu } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { CSSProperties, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import MButton from "../components/common/MButton";
import { useAuth, useStoreTheme } from "../store";
import { isMobile } from "../utils/responsive";
import { menuItems } from "./menu";
import { HeadSider, StickyButton } from "./styles";

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
  const location = useLocation();
  const { logout } = useAuth();

  const onLogout = () => {
    logout();
  };
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
  const pathSnippets = location.pathname.split("/").filter((i) => i);
  const selectedKeys = pathSnippets.map((_, index) => {
    return `/${pathSnippets.slice(0, index + 1).join("/")}`;
  });
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
            defaultSelectedKeys={["home"]}
            selectedKeys={selectedKeys}
            items={menuItems(navigate)}
            style={{ borderInlineEnd: "none" }}
          />
          <Flex
            justify="center"
            style={{ padding: 16, cursor: "pointer" }}
            onClick={onLogout}
          >
            ออกจากระบบ
          </Flex>
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
              onClick={() => setShowDrawer(false)}
            />
            <Flex
              justify="center"
              style={{ padding: 16, cursor: "pointer" }}
              onClick={onLogout}
            >
              ออกจากระบบ
            </Flex>
          </Drawer>
        </>
      )}

      <Layout>
        {isMobile(windowWidth) && (
          <StickyButton theme={theme}>
            <MButton
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setShowDrawer(true)}
              style={{ display: mobileSize ? "inline-block" : "none" }}
            />
          </StickyButton>
        )}

        <Content
          style={{
            padding: mobileSize ? 16 : 32,
            marginInlineStart: mobileSize ? 0 : collapsed ? 80 : 200,
            backgroundColor: theme.background_,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
