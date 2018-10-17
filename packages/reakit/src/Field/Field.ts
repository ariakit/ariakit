import { theme } from "styled-tools";
import styled from "../styled";
import Box, { BoxProps } from "../Box";

export interface FieldProps extends BoxProps {}

const Field = styled(Box)<FieldProps>`
  ${theme("Field")};
`;

export default Field;
