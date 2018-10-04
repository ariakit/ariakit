import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

export interface LinkProps extends BoxProps {}

const Link = styled(Box)<LinkProps>`
  ${theme("Link")};
`;

Link.defaultProps = {
  palette: "primary"
};

export default as("a")(Link);
