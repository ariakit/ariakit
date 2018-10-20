import { theme } from "styled-tools";
import styled from "../styled";
import use from "../use";
import Box, { BoxProps } from "../Box";

export interface BlockProps extends BoxProps {}

const Block = styled(Box)<BlockProps>`
  display: block;
  ${theme("Block")};
`;

export default use(Block, "div");
