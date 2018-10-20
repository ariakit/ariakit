import { theme } from "styled-tools";
import styled from "../styled";
import use from "../use";
import Flex, { FlexProps } from "../Flex";

export interface InlineFlexProps extends FlexProps {}

const InlineFlex = styled(Flex)<InlineFlexProps>`
  display: inline-flex;
  ${theme("InlineFlex")};
`;

export default use(InlineFlex, "div");
