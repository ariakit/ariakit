import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

export interface ButtonProps extends BoxProps {}

const Button = styled(Box)<ButtonProps>`
  ${theme("Button")};
`;

Button.defaultProps = {
  opaque: true,
  palette: "primary"
};

export default as("button")(Button);
