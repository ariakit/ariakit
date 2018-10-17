import { theme } from "styled-tools";
import styled from "../styled";
import Box, { BoxProps } from "../Box";

export interface AvatarProps extends BoxProps {}

const Avatar = styled(Box)<AvatarProps>`
  ${theme("Avatar")};
`;

Avatar.defaultProps = {
  use: "img"
};

export default Avatar;
