import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

export interface InlineBlockProps extends BoxProps {}

const InlineBlock = styled(Box)<InlineBlockProps>`
  display: inline-block;
  ${theme("InlineBlock")};
`;

export default as("div")(InlineBlock);
