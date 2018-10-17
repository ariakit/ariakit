import { theme } from "styled-tools";
import styled from "../styled";
import Box, { BoxProps } from "../Box";

export interface InlineBlockProps extends BoxProps {}

const InlineBlock = styled(Box)<InlineBlockProps>`
  display: inline-block;
  ${theme("InlineBlock")};
`;

export default InlineBlock;
