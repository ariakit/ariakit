import { theme } from "styled-tools";
import styled from "../styled";
import use from "../use";
import Box, { BoxProps } from "../Box";

export interface InlineBlockProps extends BoxProps {}

const InlineBlock = styled(Box)<InlineBlockProps>`
  display: inline-block;
  ${theme("InlineBlock")};
`;

export default use(InlineBlock, "div");
