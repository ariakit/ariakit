/* eslint-disable react/no-find-dom-node, react/no-unused-state */
import React from "react";
import { findDOMNode } from "react-dom";
import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Popover from "../Popover";

class Component extends React.Component {
  state = {
    visible: false
  };

  componentDidMount() {
    const controller = this.getController();
    if (controller && !this.isControlled()) {
      controller.addEventListener("mouseenter", this.show);
      controller.addEventListener("focus", this.show);
      controller.addEventListener("mouseleave", this.hide);
      controller.addEventListener("blur", this.hide);
    }
  }

  componentWillUnmount() {
    const controller = this.getController();
    if (controller) {
      controller.removeEventListener("mouseenter", this.show);
      controller.removeEventListener("focus", this.show);
      controller.removeEventListener("mouseleave", this.hide);
      controller.removeEventListener("blur", this.hide);
    }
  }

  isControlled = () => typeof this.props.visible !== "undefined";

  show = () => this.setState({ visible: true });

  hide = () => this.setState({ visible: false });

  getTooltip = () => findDOMNode(this);

  getController = () => {
    const { controller } = this.props;
    if (controller) {
      return typeof controller === "string"
        ? document.getElementById(controller)
        : controller;
    }
    return this.getTooltip().parentNode;
  };

  render() {
    const { visible } = this.isControlled() ? this.props : this.state;
    return <Popover {...this.props} visible={visible} />;
  }
}

const Tooltip = styled(Component)`
  pointer-events: none;
  white-space: nowrap;
  text-transform: none;
  font-size: 0.875em;
  text-align: center;
  color: white;
  background-color: #222;
  border-radius: 0.15384em;
  padding: 0.75em 1em;
  ${prop("theme.Tooltip")};
`;

Tooltip.defaultProps = {
  role: "tooltip",
  placement: "top"
};

export default as("div")(Tooltip);
