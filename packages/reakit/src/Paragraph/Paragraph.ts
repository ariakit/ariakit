import { theme } from "styled-tools";
import styled from "../styled";
import Box, { BoxProps } from "../Box";

export interface ParagraphProps extends BoxProps {}

const Paragraph = styled(Box)<ParagraphProps>`
  ${theme("Paragraph")};
`;

Paragraph.defaultProps = {
  use: "p"
};

export default Paragraph;
