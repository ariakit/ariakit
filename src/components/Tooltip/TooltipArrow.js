import React from "react";
import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Perpendicular from "../Perpendicular";
import Arrow from "../Arrow";

const PerpendicularArrow = Perpendicular.as(Arrow);

const Component = props => (
  <PerpendicularArrow
    alignOffset={props.align !== "center" ? "0.5rem" : 0}
    {...props}
  />
);

const TooltipArrow = styled(Component)`
  pointer-events: none;
  color: rgba(0, 0, 0, 0.85);
  border: inherit;
  font-size: 1.1764705882em;
  ${prop("theme.TooltipArrow")};
`;

TooltipArrow.defaultProps = {
  pos: "bottom",
  align: "center",
  rotate: true,
  angle: 180
};

export default as("div")(TooltipArrow);
