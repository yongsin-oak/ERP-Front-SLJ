import {
  LeftOutlined,
  MenuOutlined,
  RightOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { useTheme } from "@emotion/react";
import { useWindowSize } from "@uidotdev/usehooks";
import { Drawer, Layout, Menu } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { CSSProperties, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import MButton from "../components/common/MButton";
import Text from "../components/common/Text";
import LogoutButton from "../components/LogoutButton";
import { useStoreTheme } from "../store";
import { isMobile } from "../utils/responsive";
import { menuItems } from "./menu";
import {
  StickyButton,
  SidebarHeader,
  SidebarContent,
  MenuWrapper,
  LogoutWrapper,
  BrandContainer,
} from "./styles";
import "./sidebar-fixes.css"; // Import CSS fixes

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
    overflow: "hidden", // เปลี่ยนจาก "auto" เป็น "hidden"
    height: "100vh",
    top: 0,
    bottom: 0,
    insetInlineStart: 0,
    position: "fixed",
    borderInlineEnd: `1px solid ${theme.splitLine_}`,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // เพิ่ม smooth transition
    zIndex: 1000, // ป้องกัน overlap issues
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
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
          <SidebarHeader theme={theme}>
            <BrandContainer collapsed={collapsed}>
              <ShopOutlined
                className="brand-icon"
                style={{ color: theme.textPrimary_ }}
              />
              <Text h4 bold className="brand-text">
                ERP System
              </Text>
            </BrandContainer>
          </SidebarHeader>

          <SidebarContent>
            <MenuWrapper>
              <Menu
                theme={themeMode}
                mode="inline"
                defaultSelectedKeys={["home"]}
                selectedKeys={selectedKeys}
                items={menuItems(navigate)}
              />
            </MenuWrapper>

            <LogoutWrapper theme={theme}>
              <LogoutButton collapsed={collapsed} />
            </LogoutWrapper>
          </SidebarContent>
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
            <SidebarHeader theme={theme}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <ShopOutlined
                  style={{ fontSize: "18px", color: theme.textPrimary_ }}
                />
                <Text h5 bold>
                  ERP System
                </Text>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <MenuWrapper>
                <Menu
                  theme={themeMode}
                  mode="inline"
                  defaultSelectedKeys={["1"]}
                  items={menuItems(navigate)}
                  onClick={() => setShowDrawer(false)}
                />
              </MenuWrapper>

              <LogoutWrapper theme={theme}>
                <LogoutButton />
              </LogoutWrapper>
            </SidebarContent>
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
            transition: "margin-inline-start 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // เพิ่ม smooth transition สำหรับ content
          }}
        >
          <Outlet />{" "}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
