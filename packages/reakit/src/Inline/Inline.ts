import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

export interface InlineProps extends BoxProps {}

const Inline = styled(Box)<InlineProps>`
  display: inline;
  ${theme("Inline")};
`;

export default as("span")(Inline);
