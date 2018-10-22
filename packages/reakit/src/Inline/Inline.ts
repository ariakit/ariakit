import { theme } from "styled-tools";
import styled from "../styled";
import use from "../use";
import Box, { BoxProps } from "../Box";

export interface InlineProps extends BoxProps {}

const Inline = styled(Box)<InlineProps>`
  display: inline;
  ${theme("Inline")};
`;

export default use(Inline, "span");
