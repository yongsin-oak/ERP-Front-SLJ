import { Button, Result } from "antd";
import React from "react";

const NotFoundPage: React.FC = () => (
  <Result
    status="404"
    title="404"
    subTitle="Sorry, the page you visited does not exist."
    extra={
      <Button onClick={() => (window.location.href = "/")}>Back Home</Button>
    }
  />
);

export default NotFoundPage;
