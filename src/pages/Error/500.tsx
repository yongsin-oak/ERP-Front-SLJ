import React from "react";
import { Button, Result } from "antd";

const ErrorPage: React.FC = () => (
  <Result
    status="500"
    title="500"
    subTitle="Sorry, something went wrong."
    extra={
      <Button type="primary" onClick={() => (window.location.href = "/")}>
        Back Home
      </Button>
    }
  />
);

export default ErrorPage;
