import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

export interface HeadingProps extends BoxProps {}

const Heading = styled(Box)<HeadingProps>`
  ${theme("Heading")};
`;

export default as("h1")(Heading);
