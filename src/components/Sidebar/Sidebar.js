import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { prop, ifProp } from "styled-tools";
import as from "../../enhancers/as";
import Overlay from "../Overlay";

const Component = props => (
  <Overlay
    defaultSlide={props.align === "right" ? "left" : "right"}
    {...props}
  />
);

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
