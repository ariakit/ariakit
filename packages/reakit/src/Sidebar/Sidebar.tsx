import * as React from "react";
import * as PropTypes from "prop-types";
import { theme, ifProp } from "styled-tools";
import hoistNonReactStatics from "hoist-non-react-statics";
import styled from "../styled";
import as from "../as";
import Overlay, { OverlayProps } from "../Overlay";

export interface SidebarProps extends OverlayProps {
  align?: "left" | "right";
}

class Component extends React.Component<SidebarProps> {
  handleTouchStart = () => {
    const { hide, visible } = this.props;
    if (hide && visible) hide();
  };

  componentDidMount() {
    window.addEventListener("touchstart", () => this.handleTouchStart());
  }

  componentWillUnmount() {
    window.removeEventListener("touchstart", () => this.handleTouchStart());
  }

  render() {
    const { align, ...otherProps } = this.props;

    return (
      <Overlay
        defaultSlide={align === "right" ? "left" : "right"}
        {...otherProps}
      />
    );
  }
}

hoistNonReactStatics(Component, Overlay);

const Sidebar = styled(Component)`
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

export default as("div")(Sidebar);
