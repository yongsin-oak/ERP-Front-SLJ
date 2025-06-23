import { Result } from "antd";
import React from "react";
import MButton from "../../components/common/MButton";

const ForbiddenPage: React.FC = () => (
  <Result
    status="403"
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={
      <MButton onClick={() => (window.location.href = "/")}>Back Home</MButton>
    }
  />
);

export default ForbiddenPage;
