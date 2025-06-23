import { Result } from "antd";
import React from "react";
import MButton from "../../components/common/MButton";

const ErrorPage: React.FC = () => (
  <Result
    status="500"
    title="500"
    subTitle="Sorry, something went wrong."
    extra={
      <MButton onClick={() => (window.location.href = "/")}>Back Home</MButton>
    }
  />
);

export default ErrorPage;
