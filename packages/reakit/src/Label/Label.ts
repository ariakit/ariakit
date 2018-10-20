import { theme } from "styled-tools";
import styled from "../styled";
import use from "../use";
import Box, { BoxProps } from "../Box";

export interface LabelProps extends BoxProps {}

const Label = styled(Box)<LabelProps>`
  display: inline-block;
  ${theme("Label")};
`;

export default use(Label, "label");
