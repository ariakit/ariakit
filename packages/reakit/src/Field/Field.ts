import { theme } from "styled-tools";
import styled from "../styled";
import use from "../use";
import Box, { BoxProps } from "../Box";

export interface FieldProps extends BoxProps {}

const Field = styled(Box)<FieldProps>`
  ${theme("Field")};
`;

export default use(Field, "div");
