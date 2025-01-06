import { useTheme } from "@emotion/react";
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
};

const allowedProps = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "s1",
  "s2",
  "s3",
  "medium",
  "semiBold",
  "bold",
  "center",
];
interface Props extends Text, TextProps {
  children: React.ReactNode;
  error?: boolean;
}
const TextComponent = styled(Typography.Text, {
  shouldForwardProp: (prop) => !allowedProps.includes(prop.toString()),
})<Text>`
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
  font-family: "Kanit", sans-serif;
`;
const Text = ({ children, error, color, ...props }: Props) => {
  const theme = useTheme();
  return (
    <TextComponent
      style={{
        color: error ? theme.red300_ : color,
      }}
      {...props}
    >
      {children}
    </TextComponent>
  );
};

export default Text;
