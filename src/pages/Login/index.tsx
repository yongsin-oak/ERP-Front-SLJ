import React, { useEffect } from "react";
import { Form, Input, Button, Typography, Checkbox } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "../../store";
import req from "../../utils/req";

const { Title } = Typography;

const Login: React.FC = () => {
  const { login } = useAuth();
  const onLogin = async (values: {
    username: string;
    password: string;
    remember: boolean;
  }) => {
    login(values.username, values.password);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#f0f2f5",
      }}
    >
      <div
        style={{
          width: 300,
          padding: 24,
          backgroundColor: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
          Login
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
          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              style={{ marginBottom: 16 }}
            >
              Login
            </Button>
            <div style={{ textAlign: "center" }}>
              <a href="/forgot-password">Forgot password?</a>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
