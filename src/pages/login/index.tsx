import { LockOutlined, UserOutlined } from "@ant-design/icons";
import MButton from "@components/common/MButton";
import { useTheme } from "@emotion/react";
import { useAuth } from "@stores/auth";
import { BORDER_RADIUS, SPACING } from "@theme/constants";
import { Flex, Form, Input, Typography } from "antd";
import React, { useState } from "react";
import { Navigate } from "react-router-dom";

const { Title } = Typography;

const Login: React.FC = () => {
  const { isAuth, login } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const theme = useTheme();
  const onLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    await login(values.username, values.password);
    setLoading(false);
  };

  return isAuth ? (
    <Navigate to="/" replace />
  ) : (
    <Flex
      style={{
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100%",
        backgroundColor: theme.background_,
      }}
      justify="center"
      align="center"
    >
      <div
        style={{
          width: 300,
          padding: SPACING["2xl"],
          backgroundColor: theme.backgroundBox_ || theme.backgroundElevated_,
          borderRadius: BORDER_RADIUS.lg,
          border: `1px solid ${theme.border_}`,
          boxShadow: theme.boxShadow_,
        }}
      >
        <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
          เข้าสู่ระบบ
        </Title>
        <Form
          name="login_form"
          onFinish={onLogin}
          initialValues={{ remember: true }}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please enter your username!" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <MButton
              htmlType="submit"
              block
              size="large"
              style={{
                margin: "auto",
              }}
              loading={loading}
            >
              เข้าสู่ระบบ
            </MButton>
          </Form.Item>
        </Form>
      </div>
    </Flex>
  );
};

export default Login;
