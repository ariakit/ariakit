import { theme } from "styled-tools";
import styled from "../styled";
import Box, { BoxProps } from "../Box";

export interface ImageProps extends BoxProps {}

const Image = styled(Box)<ImageProps>`
  ${theme("Image")};
`;

Image.defaultProps = {
  use: "img"
};

export default Image;
