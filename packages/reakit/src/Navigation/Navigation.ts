import { theme } from "styled-tools";
import styled from "../styled";
import Box, { BoxProps } from "../Box";

export interface NavigationProps extends BoxProps {}

const Navigation = styled(Box)<NavigationProps>`
  ${theme("Navigation")};
`;

Navigation.defaultProps = {
  use: "nav"
};

export default Navigation;
