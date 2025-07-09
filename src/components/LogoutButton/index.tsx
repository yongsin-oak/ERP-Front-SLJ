import { LogoutOutlined } from "@ant-design/icons";
import { useTheme } from "@emotion/react";
import { Flex } from "antd";
import MButton from "../common/MButton";
import { useAuth } from "../../store";
const LogoutButton = () => {
  const theme = useTheme();
  const { logout } = useAuth();

  const onLogout = () => {
    logout();
  };
  return (
    <Flex justify="center" style={{ padding: 16 }}>
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
          gap: 8,
          padding: "8px 12px",
          borderRadius: 6,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor =
            theme.hoverBackground_ || "rgba(0,0,0,0.04)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        ออกจากระบบ
      </MButton>
    </Flex>
  );
};

export default LogoutButton;
