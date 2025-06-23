import { Result } from "antd";
import React from "react";
import MButton from "../../components/common/MButton";

const NotFoundPage: React.FC = () => (
  <Result
    status="404"
    title="404"
    subTitle="Sorry, the page you visited does not exist."
    extra={
      <MButton onClick={() => (window.location.href = "/")}>Back Home</MButton>
    }
  />
);

export default NotFoundPage;
