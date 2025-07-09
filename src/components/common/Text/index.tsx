import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { Typography } from "antd";
import { TextProps } from "antd/es/typography/Text";
import React from "react";
import { FONT_SIZE, FONT_WEIGHT, BREAKPOINTS } from "../../../theme/constants";

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
  // Responsive props
  responsive?: boolean;
  mobileSize?:
    | "xs"
    | "sm"
    | "base"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl";
  tabletSize?:
    | "xs"
    | "sm"
    | "base"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl";
  desktopSize?:
    | "xs"
    | "sm"
    | "base"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl";
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
  "responsive",
  "mobileSize",
  "tabletSize",
  "desktopSize",
];
interface Props extends Text, TextProps {
  children: React.ReactNode;
  error?: boolean;
}
const TextComponent = styled(Typography.Text, {
  shouldForwardProp: (prop) => !allowedProps.includes(prop.toString()),
})<Text>`
  font-size: ${FONT_SIZE.base};
  font-size: ${(props) => props.h1 && FONT_SIZE["5xl"]};
  font-size: ${(props) => props.h2 && FONT_SIZE["3xl"]};
  font-size: ${(props) => props.h3 && FONT_SIZE["2xl"]};
  font-size: ${(props) => props.h4 && FONT_SIZE.xl};
  font-size: ${(props) => props.h5 && FONT_SIZE.lg};
  font-size: ${(props) => props.h6 && FONT_SIZE.base};
  font-size: ${(props) => props.s1 && FONT_SIZE.sm};
  font-size: ${(props) => props.s2 && FONT_SIZE.xs};
  font-size: ${(props) => props.s3 && FONT_SIZE.xxs};
  font-weight: ${(props) => props.medium && FONT_WEIGHT.medium};
  font-weight: ${(props) => props.semiBold && FONT_WEIGHT.semibold};
  font-weight: ${(props) => props.bold && FONT_WEIGHT.bold};
  text-align: ${(props) => props.center && "center"};
  font-family: "Kanit", sans-serif;

  /* Auto responsive font sizes */
  ${(props) =>
    props.h1 &&
    `
    @media (max-width: ${BREAKPOINTS.md}) {
      font-size: ${FONT_SIZE["3xl"]};
    }
    @media (max-width: ${BREAKPOINTS.sm}) {
      font-size: ${FONT_SIZE["2xl"]};
    }
  `}

  ${(props) =>
    props.h2 &&
    `
    @media (max-width: ${BREAKPOINTS.md}) {
      font-size: ${FONT_SIZE["2xl"]};
    }
    @media (max-width: ${BREAKPOINTS.sm}) {
      font-size: ${FONT_SIZE.xl};
    }
  `}
  
  ${(props) =>
    props.h3 &&
    `
    @media (max-width: ${BREAKPOINTS.md}) {
      font-size: ${FONT_SIZE.xl};
    }
    @media (max-width: ${BREAKPOINTS.sm}) {
      font-size: ${FONT_SIZE.lg};
    }
  `}
  
  ${(props) =>
    props.h4 &&
    `
    @media (max-width: ${BREAKPOINTS.md}) {
      font-size: ${FONT_SIZE.lg};
    }
    @media (max-width: ${BREAKPOINTS.sm}) {
      font-size: ${FONT_SIZE.base};
    }
  `}
  
  ${(props) =>
    props.h5 &&
    `
    @media (max-width: ${BREAKPOINTS.md}) {
      font-size: ${FONT_SIZE.base};
    }
    @media (max-width: ${BREAKPOINTS.sm}) {
      font-size: ${FONT_SIZE.sm};
    }
  `}
  
  ${(props) =>
    props.h6 &&
    `
    @media (max-width: ${BREAKPOINTS.sm}) {
      font-size: ${FONT_SIZE.sm};
    }
  `}

  /* Custom responsive font sizes (optional) */
  ${(props) =>
    props.responsive &&
    props.mobileSize &&
    `
    @media (max-width: ${BREAKPOINTS.md}) {
      font-size: ${FONT_SIZE[props.mobileSize]};
    }
  `}
  
  ${(props) =>
    props.responsive &&
    props.tabletSize &&
    `
    @media (min-width: ${BREAKPOINTS.md}) and (max-width: ${BREAKPOINTS.lg}) {
      font-size: ${FONT_SIZE[props.tabletSize]};
    }
  `}
  
  ${(props) =>
    props.responsive &&
    props.desktopSize &&
    `
    @media (min-width: ${BREAKPOINTS.lg}) {
      font-size: ${FONT_SIZE[props.desktopSize]};
    }
  `}
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
