import { theme } from "styled-tools";
import styled from "../styled";
import use from "../use";
import Box, { BoxProps } from "../Box";

export interface NavigationProps extends BoxProps {}

const Navigation = styled(Box)<NavigationProps>`
  ${theme("Navigation")};
`;

export default use(Navigation, "nav");
