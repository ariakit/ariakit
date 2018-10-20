import * as React from "react";
import * as PropTypes from "prop-types";
import { theme, ifProp } from "styled-tools";
import hoist from "../_utils/hoist";
import styled from "../styled";
import use from "../use";
import Overlay, { OverlayProps } from "../Overlay";

export interface SidebarProps extends OverlayProps {
  align?: "left" | "right";
}

const SidebarComponent = (props: SidebarProps) => (
  <Overlay
    defaultSlide={props.align === "right" ? "left" : "right"}
    {...props}
  />
);

const Sidebar = styled(hoist(SidebarComponent, Overlay))`
  top: 0;
  height: 100vh;
  transform: none;
  overflow: auto;
  left: ${ifProp({ align: "right" }, "auto", 0)};
  right: ${ifProp({ align: "right" }, 0, "auto")};
  ${theme("Sidebar")};
`;

// @ts-ignore
Sidebar.propTypes = {
  align: PropTypes.oneOf(["left", "right"])
};

Sidebar.defaultProps = {
  align: "left",
  translateX: 0,
  translateY: 0
};

export default use(Sidebar, "div");
