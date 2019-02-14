import { theme, withProp } from "styled-tools";
import styled from "../styled";
import use from "../use";
import Box, { BoxProps } from "../Box";

export type StackAnchor = "top" | "right" | "bottom" | "left";

export interface StackProps extends BoxProps {
  anchor?: StackAnchor[];
}

const ifAnchor = (anchor: StackAnchor, style: string) =>
  withProp("anchor", anchors => (anchors.includes(anchor) ? style : ""));

const Stack = styled(Box)<StackProps>`
  position: relative;

  > *:not(:first-child) {
    position: absolute;
    ${ifAnchor("top", "top: 0;")}
    ${ifAnchor("right", "right: 0;")}
    ${ifAnchor("bottom", "bottom: 0;")}
    ${ifAnchor("left", "left: 0;")}
  }

  ${theme("Stack")};
`;

Stack.defaultProps = {
  anchor: ["top", "left"]
};

export default use(Stack, "div");
