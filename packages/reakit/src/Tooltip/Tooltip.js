/* eslint-disable react/no-unused-state */
import React from "react";
import { findDOMNode } from "react-dom";
import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Popover from "../Popover";

class Component extends React.Component {
  state = {
    visible: false
  };

  componentDidMount() {
    const { parentNode } = this.getTooltip();
    if (parentNode && !this.isControlled()) {
      parentNode.addEventListener("mouseenter", this.show);
      parentNode.addEventListener("focus", this.show);
      parentNode.addEventListener("mouseleave", this.hide);
      parentNode.addEventListener("blur", this.hide);
    }
  }

  componentWillUnmount() {
    const { parentNode } = this.getTooltip();
    if (parentNode) {
      parentNode.removeEventListener("mouseenter", this.show);
      parentNode.removeEventListener("focus", this.show);
      parentNode.removeEventListener("mouseleave", this.hide);
      parentNode.removeEventListener("blur", this.hide);
    }
  }

  isControlled = () => typeof this.props.visible !== "undefined";

  show = () => this.setState({ visible: true });

  hide = () => this.setState({ visible: false });

  getTooltip = () => findDOMNode(this);

  render() {
    const { visible } = this.isControlled() ? this.props : this.state;
    return <Popover {...this.props} visible={visible} />;
  }
}

const Tooltip = styled(Component)`
  pointer-events: none;
  white-space: nowrap;
  ${prop("theme.Tooltip")};
`;

Tooltip.defaultProps = {
  role: "tooltip",
  placement: "top"
};

export default as("div")(Tooltip);
