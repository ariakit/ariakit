import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import PerpendicularFade from "../Perpendicular/PerpendicularFade";
import Popover from "./Popover";

const PopoverFade = styled(Popover.as(PerpendicularFade))`
  ${prop("theme.PopoverFade")};
`;

PopoverFade.defaultProps = {
  ...PerpendicularFade.defaultProps,
  ...Popover.defaultProps
};

export default as("div")(PopoverFade);
