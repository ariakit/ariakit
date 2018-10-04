import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

export interface NavigationProps extends BoxProps {}

const Navigation = styled(Box)<NavigationProps>`
  ${theme("Navigation")};
`;

export default as("nav")(Navigation);
