import { theme } from "styled-tools";
import styled from "../styled";
import Box, { BoxProps } from "../Box";

export interface BlockquoteProps extends BoxProps {}

const Blockquote = styled(Box)<BlockquoteProps>`
  ${theme("Blockquote")};
`;

Blockquote.defaultProps = {
  use: "blockquote"
};

export default Blockquote;
