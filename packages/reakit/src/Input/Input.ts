import { theme } from "styled-tools";
import styled from "../styled";
import Box, { BoxProps } from "../Box";

export interface InputProps extends BoxProps {}

const Input = styled(Box)<InputProps>`
  ${theme("Input")};
`;

Input.defaultProps = {
  use: "input",
  type: "text",
  opaque: true,
  palette: "white"
};

export default Input;
