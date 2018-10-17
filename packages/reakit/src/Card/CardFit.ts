import { theme } from "styled-tools";
import styled from "../styled";
import Box, { BoxProps } from "../Box";

export interface CardFitProps extends BoxProps {}

const CardFit = styled(Box)<CardFitProps>`
  ${theme("CardFit")};
`;

export default CardFit;
