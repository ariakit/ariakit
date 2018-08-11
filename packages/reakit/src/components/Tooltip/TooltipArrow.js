import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import PopoverArrow from "../Popover/PopoverArrow";

const TooltipArrow = styled(PopoverArrow)`
  color: #222;
  border: none;
  ${prop("theme.TooltipArrow")};
`;

export default as("div")(TooltipArrow);
