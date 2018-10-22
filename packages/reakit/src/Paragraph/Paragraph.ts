import { theme } from "styled-tools";
import styled from "../styled";
import use from "../use";
import Box, { BoxProps } from "../Box";

export interface ParagraphProps extends BoxProps {}

const Paragraph = styled(Box)<ParagraphProps>`
  ${theme("Paragraph")};
`;

export default use(Paragraph, "p");
