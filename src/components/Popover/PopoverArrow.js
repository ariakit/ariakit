import React from "react";
import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Perpendicular from "../Perpendicular";
import Arrow from "../Arrow";
import Box from "../Box";

const PerpendicularArrowBox = Perpendicular.as([Arrow, Box]);

const Component = props => (
  <PerpendicularArrowBox
    alignOffset={props.align !== "center" ? "0.5rem" : 0}
    {...props}
  />
);

const PopoverArrow = styled(Component)`
  color: white;
  border: inherit;
  border-top: 0;
  font-size: 1.25em;
  border-radius: 0;
  ${prop("theme.PopoverArrow")};
`;

PopoverArrow.defaultProps = {
  pos: "top",
  align: "center",
  rotate: true,
  angle: 180
};

export default as("div")(PopoverArrow);
