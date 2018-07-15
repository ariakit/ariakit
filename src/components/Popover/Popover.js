import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Hidden from "../Hidden";
import Perpendicular from "../Perpendicular";
import Box from "../Box";

const HiddenPerpendicularBox = Hidden.as([Perpendicular, Box]);

const Component = props => {
  const slide = props.slide === true ? "bottom" : props.slide;
  const expand = props.expand === true ? "bottom" : props.expand;
  return (
    <HiddenPerpendicularBox
      id={props.popoverId}
      {...props}
      slide={slide}
      expand={expand}
    />
  );
};

const Popover = styled(Component)`
  user-select: auto;
  cursor: auto;
  color: inherit;
  background-color: white;
  padding: 1em;
  z-index: 999;
  outline: 0;
  ${prop("theme.Popover")};
`;

Popover.propTypes = {
  popoverId: PropTypes.string
};

Popover.defaultProps = {
  role: "group",
  pos: "bottom",
  align: "center",
  hideOnEsc: true
};

export default as("div")(Popover);
