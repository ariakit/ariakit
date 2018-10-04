import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

export interface ImageProps extends BoxProps {}

const Image = styled(Box)<ImageProps>`
  ${theme("Image")};
`;

export default as("img")(Image);
