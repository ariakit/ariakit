import { theme } from "styled-tools";
import styled from "../styled";
import Box, { BoxProps } from "../Box";

export interface HeadingProps extends BoxProps {}

const Heading = styled(Box)<HeadingProps>`
  ${theme("Heading")};
`;

Heading.defaultProps = {
  use: "h1"
};

export default Heading;
