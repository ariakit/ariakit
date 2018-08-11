import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { prop, withProp } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";
import numberToPx from "../../utils/numberToPx";

const Component = props => (
  <Base
    aria-orientation={props.vertical ? "vertical" : "horizontal"}
    {...props}
  />
);

const Toolbar = styled(Component)`
  position: relative;
  display: grid;
  width: 100%;
  padding: ${withProp("gutter", numberToPx)};
  grid-gap: ${withProp("gutter", numberToPx)};
  grid-template:
    "start center end"
    / 1fr auto 1fr;

  &[aria-orientation="vertical"] {
    width: min-content;
    height: 100%;
    grid-template:
      "start" 1fr
      "center" auto
      "end" 1fr;
  }

  ${prop("theme.Toolbar")};
`;

Toolbar.propTypes = {
  gutter: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  vertical: PropTypes.bool
};

Toolbar.defaultProps = {
  role: "toolbar",
  gutter: 8
};

export default as("div")(Toolbar);
