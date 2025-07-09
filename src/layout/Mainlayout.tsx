import { LeftOutlined, MenuOutlined, RightOutlined } from "@ant-design/icons";
import { useTheme } from "@emotion/react";
import { useWindowSize } from "@uidotdev/usehooks";
import { Drawer, Layout, Menu } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { CSSProperties, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import MButton from "../components/common/MButton";
import LogoutButton from "../components/LogoutButton";
import { useStoreTheme } from "../store";
import { isMobile } from "../utils/responsive";
import { menuItems } from "./menu";
import { StickyButton } from "./styles";

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const { themeMode } = useStoreTheme();
  const theme = useTheme();
  const navigate = useNavigate();
  const { width: windowWidth } = useWindowSize();
  const mobileSize = windowWidth && isMobile(windowWidth);
  const location = useLocation();
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
          <Menu
            theme={themeMode}
            mode="inline"
            defaultSelectedKeys={["home"]}
            selectedKeys={selectedKeys}
            items={menuItems(navigate)}
            style={{ borderInlineEnd: "none" }}
          />
          <LogoutButton />
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
            <Menu
              theme={themeMode}
              mode="inline"
              defaultSelectedKeys={["1"]}
              items={menuItems(navigate)}
              style={{ borderInlineEnd: "none" }}
              onClick={() => setShowDrawer(false)}
            />
            <LogoutButton />
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
          <Outlet />{" "}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
