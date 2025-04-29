import React from "react";
import { Button, Result } from "antd";

const ForbiddenPage: React.FC = () => (
  <Result
    status="403"
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={
      <Button type="primary" onClick={() => (window.location.href = "/")}>
        Back Home
      </Button>
    }
  />
);

export default ForbiddenPage;
