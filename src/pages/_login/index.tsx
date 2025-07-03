import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Checkbox, Form, Input, Typography } from "antd";
import React from "react";
import { Navigate } from "react-router-dom";
import MButton from "../../components/common/MButton";
import { useAuth } from "../../store";

const { Title } = Typography;

const Login: React.FC = () => {
  const { isLoadingUser, isAuth, login } = useAuth();
  const onLogin = async (values: {
    username: string;
    password: string;
    remember: boolean;
  }) => {
    login(values.username, values.password);
  };
  if (isLoadingUser) {
    return <div>Loading...</div>;
  }

  return isAuth ? (
    <Navigate to="/" replace />
  ) : (
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
            >
              เข้าสู่ระบบ
            </MButton>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
