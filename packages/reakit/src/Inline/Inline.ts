import { theme } from "styled-tools";
import styled from "../styled";
import Box, { BoxProps } from "../Box";

export interface InlineProps extends BoxProps {}

const Inline = styled(Box)<InlineProps>`
  display: inline;
  ${theme("Inline")};
`;

Inline.defaultProps = {
  use: "span"
};

export default Inline;
