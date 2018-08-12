import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import PopoverArrow from "../Popover/PopoverArrow";

const TooltipArrow = styled(PopoverArrow)`
  color: #222;
  border: none;
  ${prop("theme.TooltipArrow")};
`;

export default as("div")(TooltipArrow);
