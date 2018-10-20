import { theme } from "styled-tools";
import styled from "../styled";
import use from "../use";
import Box, { BoxProps } from "../Box";

export interface LinkProps extends BoxProps {}

const Link = styled(Box)<LinkProps>`
  ${theme("Link")};
`;

Link.defaultProps = {
  palette: "primary"
};

export default use(Link, "a");
