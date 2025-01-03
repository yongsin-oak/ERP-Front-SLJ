import styled from "@emotion/styled";
import { Typography } from "antd";
import { TextProps } from "antd/es/typography/Text";
import React from "react";

type Text = {
  h1?: boolean;
  h2?: boolean;
  h3?: boolean;
  h4?: boolean;
  h5?: boolean;
  h6?: boolean;
  s1?: boolean;
  s2?: boolean;
  s3?: boolean;
  medium?: boolean;
  semiBold?: boolean;
  bold?: boolean;
  center?: boolean;
  color?: string;
};
interface Props extends Text, TextProps {
  children: React.ReactNode;
}
const Text = ({ children, ...props }: Props) => {
  const TextComponent = styled(Typography.Text)<Text>`
    font-size: 16px;
    font-size: ${(props) => props.h1 && "32px"};
    font-size: ${(props) => props.h2 && "28px"};
    font-size: ${(props) => props.h3 && "24px"};
    font-size: ${(props) => props.h4 && "20px"};
    font-size: ${(props) => props.h5 && "18px"};
    font-size: ${(props) => props.h6 && "16px"};
    font-size: ${(props) => props.s1 && "14px"};
    font-size: ${(props) => props.s2 && "12px"};
    font-size: ${(props) => props.s3 && "10px"};
    font-weight: ${(props) => props.medium && "500"};
    font-weight: ${(props) => props.semiBold && "600"};
    font-weight: ${(props) => props.bold && "700"};
    text-align: ${(props) => props.center && "center"};
    color: ${(props) => props.color};
    font-family: "Kanit", sans-serif;
  `;
  return <TextComponent {...props}>{children}</TextComponent>;
};

export default Text;
