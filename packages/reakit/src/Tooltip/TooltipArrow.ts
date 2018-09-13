import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import PopoverArrow from "../Popover/PopoverArrow";

const TooltipArrow = styled(PopoverArrow)`
  ${theme("TooltipArrow")};
`;

TooltipArrow.defaultProps = {
  palette: "grayscale"
};

export default as("div")(TooltipArrow);
