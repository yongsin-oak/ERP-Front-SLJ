import { LogoutOutlined } from "@ant-design/icons";
import { useTheme } from "@emotion/react";
import { Flex } from "antd";
import MButton from "../common/MButton";
import { useAuth } from "../../stores";

interface LogoutButtonProps {
  collapsed?: boolean;
}

const LogoutButton = ({ collapsed = false }: LogoutButtonProps) => {
  const theme = useTheme();
  const { logout } = useAuth();

  const onLogout = () => {
    logout();
  };

  return (
    <Flex justify="center" style={{ padding: collapsed ? 8 : 16 }}>
      <MButton
        type="text"
        icon={<LogoutOutlined />}
        onClick={onLogout}
        style={{
          color: theme.textPrimary_,
          backgroundColor: "transparent",
          border: "none",
          fontWeight: 500,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          gap: collapsed ? 0 : 8,
          padding: collapsed ? "8px" : "8px 12px",
          borderRadius: 6,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // ปรับปรุง transition
          width: collapsed ? 40 : "auto",
          height: 40,
          justifyContent: "center",
          overflow: "hidden", // ป้องกัน text overflow
          whiteSpace: "nowrap", // ป้องกัน text wrap
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor =
            theme.hoverBackground_ || "rgba(0,0,0,0.04)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        {!collapsed && (
          <span
            style={{
              opacity: collapsed ? 0 : 1,
              transform: collapsed ? "translateX(-10px)" : "translateX(0)",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            ออกจากระบบ
          </span>
        )}
      </MButton>
    </Flex>
  );
};

export default LogoutButton;
