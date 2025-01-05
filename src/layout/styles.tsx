import { Theme } from "@emotion/react";
import styled from "@emotion/styled";
interface HeadSiderProps {
  justifyContent?: string;
}

export const HeadSider = styled.div<HeadSiderProps>`
  width: calc(100% - 8px);
  height: 48px;
  margin-block: 4px;
  margin-inline: 4px;
  display: flex;
  padding: 8px;
  padding-inline: 24px;
  justify-content: ${(props) => props.justifyContent};
`;
export const StickyButton = styled.div<{ theme: Theme }>`
  position: sticky;
  width: 100%;
  top: 0;
  z-index: 1000;
  background-color: ${(props) => props.theme.background_};
  padding: 8px 16px;
  display: flex;
  border-bottom: 1px solid ${(props) => props.theme.splitLine_};
`;
