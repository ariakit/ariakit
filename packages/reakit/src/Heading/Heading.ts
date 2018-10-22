import { theme } from "styled-tools";
import styled from "../styled";
import use from "../use";
import Box, { BoxProps } from "../Box";

export interface HeadingProps extends BoxProps {}

const Heading = styled(Box)<HeadingProps>`
  ${theme("Heading")};
`;

export default use(Heading, "h1");
