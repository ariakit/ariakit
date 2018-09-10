import React from "react";
import PropTypes from "prop-types";
import { prop, withProp } from "styled-tools";
import hoistNonReactStatics from "hoist-non-react-statics";
import numberToPx from "../_utils/numberToPx";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Component = props => (
  <Base
    aria-orientation={props.vertical ? "vertical" : "horizontal"}
    {...props}
  />
);

hoistNonReactStatics(Component, Base);

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
