import { theme } from "styled-tools";
import styled from "../styled";
import Box, { BoxProps } from "../Box";

export interface LabelProps extends BoxProps {}

const Label = styled(Box)<LabelProps>`
  display: inline-block;
  ${theme("Label")};
`;

Label.defaultProps = {
  use: "label"
};

export default Label;
