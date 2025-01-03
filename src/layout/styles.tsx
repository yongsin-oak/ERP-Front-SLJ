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
