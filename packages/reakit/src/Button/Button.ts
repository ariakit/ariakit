import { theme } from "styled-tools";
import styled from "../styled";
import Box, { BoxProps } from "../Box";

export interface ButtonProps extends BoxProps {}

const Button = styled(Box)<ButtonProps>`
  ${theme("Button")};
`;

Button.defaultProps = {
  use: "button",
  opaque: true,
  palette: "primary"
};

export default Button;
