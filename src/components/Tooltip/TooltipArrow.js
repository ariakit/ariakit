import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Perpendicular from "../Perpendicular";
import Arrow from "../Arrow";

const PerpendicularArrow = Perpendicular.as(Arrow);

const TooltipArrow = styled(PerpendicularArrow)`
  pointer-events: none;
  color: rgba(0, 0, 0, 0.85);
  border: inherit;
  font-size: 1.1764705882em;
  ${prop("theme.TooltipArrow")};
`;

TooltipArrow.defaultProps = {
  pos: "bottom",
  align: "center",
  gutter: "0px",
  rotate: true,
  reverse: true
};

export default as("div")(TooltipArrow);
