import { theme } from "styled-tools";
import styled from "../styled";
import use from "../use";
import PopoverArrow, { PopoverArrowProps } from "../Popover/PopoverArrow";

export interface TooltipArrowProps extends PopoverArrowProps {}

const TooltipArrow = styled(PopoverArrow)<TooltipArrowProps>`
  ${theme("TooltipArrow")};
`;

TooltipArrow.defaultProps = {
  palette: "grayscale"
};

export default use(TooltipArrow, "div");
