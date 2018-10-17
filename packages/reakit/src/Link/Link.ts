import { theme } from "styled-tools";
import styled from "../styled";
import Box, { BoxProps } from "../Box";

export interface LinkProps extends BoxProps {}

const Link = styled(Box)<LinkProps>`
  ${theme("Link")};
`;

Link.defaultProps = {
  use: "a",
  palette: "primary"
};

export default Link;
