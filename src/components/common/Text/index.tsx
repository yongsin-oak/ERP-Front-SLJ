import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { Typography } from "antd";
import { TextProps } from "antd/es/typography/Text";
import React from "react";
import { FONT_SIZE, FONT_WEIGHT, BREAKPOINTS } from "@theme/constants";

type Text = {
  /**
   * Heading 1 - Extra large text (48px/3xl)
   * Auto responsive: 32px on tablet, 24px on mobile
   */
  h1?: boolean;

  /**
   * Heading 2 - Large text (32px/2xl)
   * Auto responsive: 24px on tablet, 20px on mobile
   */
  h2?: boolean;

  /**
   * Heading 3 - Medium large text (24px/xl)
   * Auto responsive: 20px on tablet, 18px on mobile
   */
  h3?: boolean;

  /**
   * Heading 4 - Medium text (20px/lg)
   * Auto responsive: 18px on tablet, 16px on mobile
   */
  h4?: boolean;

  /**
   * Heading 5 - Small heading (18px/lg)
   * Auto responsive: 16px on tablet, 14px on mobile
   */
  h5?: boolean;

  /**
   * Heading 6 - Extra small heading (16px/base)
   * Auto responsive: 14px on mobile
   */
  h6?: boolean;

  /** Small text size 1 (14px/sm) */
  s1?: boolean;

  /** Small text size 2 (12px/xs) */
  s2?: boolean;

  /** Small text size 3 (10px/xxs) */
  s3?: boolean;

  /** Font weight medium (500) */
  medium?: boolean;

  /** Font weight semi-bold (600) */
  semiBold?: boolean;

  /** Font weight bold (700) */
  bold?: boolean;

  /** Center text alignment */
  center?: boolean;

  /** Enable custom responsive sizing */
  responsive?: boolean;

  /**
   * Font size on mobile devices (max-width: 768px)
   * @example "sm" = 14px, "base" = 16px, "lg" = 18px
   */
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

  /**
   * Font size on tablet devices (768px - 1024px)
   * @example "sm" = 14px, "base" = 16px, "lg" = 18px
   */
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

  /**
   * Font size on desktop devices (min-width: 1024px)
   * @example "sm" = 14px, "base" = 16px, "lg" = 18px
   */
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
  /** Text content to display */
  children: React.ReactNode;

  /** Display text in error color (red) */
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
/**
 * Custom Text component with responsive typography support
 *
 * @example
 * ```tsx
 * // Basic headings
 * <Text h1>Main Title (48px)</Text>
 * <Text h2>Subtitle (32px)</Text>
 *
 * // Small text
 * <Text s1>Small text (14px)</Text>
 *
 * // Font weights
 * <Text bold>Bold text</Text>
 * <Text semiBold>Semi-bold text</Text>
 *
 * // Custom responsive
 * <Text responsive desktopSize="xl" mobileSize="sm">
 *   Responsive text
 * </Text>
 *
 * // Error state
 * <Text error>Error message</Text>
 * ```
 */
const Text = ({ children, error, color, ...props }: Props) => {
  const theme = useTheme();
  return (
    <TextComponent
      style={{
        color: error ? theme.error_ : color,
      }}
      {...props}
    >
      {children}
    </TextComponent>
  );
};

export default Text;
