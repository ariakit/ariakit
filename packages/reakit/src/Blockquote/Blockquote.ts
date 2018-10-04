import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

export interface BlockquoteProps extends BoxProps {}

const Blockquote = styled(Box)<BlockquoteProps>`
  ${theme("Blockquote")};
`;

export default as("blockquote")(Blockquote);
