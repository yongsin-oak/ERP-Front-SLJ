import { MoonFilled, SunFilled } from "@ant-design/icons";
import { useTheme, Theme } from "@emotion/react";
import styled from "@emotion/styled";
import { useStoreTheme } from "@stores/theme";
import {
  BORDER_RADIUS,
  SPACING,
  Z_INDEX,
  TRANSITION,
  FONT_SIZE,
} from "@theme/constants";

const FloatingButton = styled.div<{ theme: Theme }>`
  position: fixed;
  bottom: ${SPACING["2xl"]};
  right: ${SPACING["2xl"]};
  width: 56px;
  height: 56px;
  border-radius: ${BORDER_RADIUS.round};
  background-color: ${(props) => props.theme.backgroundElevated_};
  border: 1px solid ${(props) => props.theme.border_};
  box-shadow: ${(props) => props.theme.boxShadow_};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${TRANSITION.all};
  z-index: ${Z_INDEX.floating};

  &:hover {
    background-color: ${(props) => props.theme.hoverBackground_};
    transform: scale(1.1);
  }

  &:active {
    background-color: ${(props) => props.theme.activeBackground_};
    transform: scale(0.95);
  }
`;

const FloatingThemeButton = () => {
  const { setTheme, themeMode } = useStoreTheme();
  const theme = useTheme();
  const isDark = themeMode === "dark";

  return (
    <FloatingButton
      theme={theme}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <SunFilled
          style={{
            fontSize: FONT_SIZE["2xl"],
            color: theme.textPrimary_,
          }}
        />
      ) : (
        <MoonFilled
          style={{
            fontSize: FONT_SIZE["2xl"],
            color: theme.textPrimary_,
          }}
        />
      )}
    </FloatingButton>
  );
};

export default FloatingThemeButton;
