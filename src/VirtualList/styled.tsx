import { CSSProperties } from "react";
import { styled } from "styled-components";

export interface IStyledVirtualListProps {
  height?: CSSProperties["height"];
}

export const Scroller = styled.div<IStyledVirtualListProps>`
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: ${({ height }) => height && `${height}`};
`;
