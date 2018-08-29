import React from "react";
import PropTypes from "prop-types";
import { prop, ifProp } from "styled-tools";
import hoistNonReactStatics from "hoist-non-react-statics";
import styled from "../styled";
import as from "../as";
import Overlay from "../Overlay";

const Component = props => (
  <Overlay
    defaultSlide={props.align === "right" ? "left" : "right"}
    {...props}
  />
);

hoistNonReactStatics(Component, Overlay);

const Sidebar = styled(Component)`
  top: 0;
  height: 100vh;
  transform: none;
  overflow: auto;
  left: ${ifProp({ align: "right" }, "auto", 0)};
  right: ${ifProp({ align: "right" }, 0, "auto")};
  ${prop("theme.Sidebar")};
`;

Sidebar.propTypes = {
  align: PropTypes.oneOf(["left", "right"])
};

Sidebar.defaultProps = {
  align: "left",
  translateX: 0,
  translateY: 0
};

export default as("div")(Sidebar);
