import { theme } from "styled-tools";
import styled from "../styled";
import use from "../use";
import Box, { BoxProps } from "../Box";

export interface BlockquoteProps extends BoxProps {}

const Blockquote = styled(Box)<BlockquoteProps>`
  ${theme("Blockquote")};
`;

export default use(Blockquote, "blockquote");
