/* eslint-disable react/no-find-dom-node */
import React from "react";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";
import styled from "styled-components";
import { prop } from "styled-tools";
import Popper from "popper.js";
import as from "../../enhancers/as";
import numberToPx from "../../utils/numberToPx";
import Hidden from "../Hidden";
import Box from "../Box";
import PopoverArrow from "./PopoverArrow";

const HiddenBox = Hidden.as(Box);

class Component extends React.Component {
  state = {
    placement: this.props.placement,
    translateX: undefined,
    translateY: undefined,
    originX: undefined,
    originY: undefined
  };

  getReference = () => {
    const { controller } = this.props;
    return typeof controller === "string"
      ? document.getElementById(controller)
      : controller || findDOMNode(this).parentNode;
  };

  getPopover = () => findDOMNode(this);

  modifierFn = data => {
    const { placement, offsets, arrowElement, arrowStyles } = data;
    const { popper, arrow } = offsets;
    const [position] = placement.split("-");
    const minus = ["bottom", "right"].indexOf(position) >= 0;
    // abstract everything
    if (arrow) {
      const { top, left } = arrowStyles;
      arrowElement.style.top = `${top}px`;
      arrowElement.style.left = `${left}px`;
      this.setState({
        originX: left
          ? `${numberToPx(left)} - 50% + ${arrowElement.clientWidth / 2}px`
          : `${minus ? "-" : ""}${arrowElement.clientHeight}px`,
        originY: top
          ? `${numberToPx(top)} - 50% + ${arrowElement.clientHeight / 2}px`
          : `${minus ? "-" : ""}${arrowElement.clientWidth}px`
      });
    } else {
      // need to consider start, end
      this.setState({
        originX: 0,
        originY: 0
      });
    }
    this.setState(
      {
        translateX: popper.left,
        translateY: popper.top,
        placement: data.placement
      },
      () => {
        console.log(this.state);
      }
    );
    return data;
  };

  getOptions = () => {
    const { placement } = this.props;
    const popover = this.getPopover();
    const arrowClassName = `.${PopoverArrow.styledComponentId}`;
    const arrow = popover.querySelector(arrowClassName);
    return {
      placement,
      modifiers: {
        applyStyle: { enabled: false },
        arrow: { enabled: !!arrow, element: arrow },
        flip: { padding: 16 },
        offset: { offset: "0, 12" },
        setState: {
          enabled: true,
          order: 900,
          fn: this.modifierFn
        }
      }
    };
  };

  initPopper = () => {
    const reference = this.getReference();
    const popover = this.getPopover();
    if (!this.popper) {
      this.popper = new Popper(reference, popover, this.getOptions());
    }
  };

  destroyPopper = () => {
    if (this.popper) {
      this.popper.destroy();
      this.popper = undefined;
    }
  };

  componentDidMount() {
    this.initPopper();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.visible !== this.props.visible ||
      prevProps.placement !== this.props.placement ||
      prevProps.children !== this.props.children
    ) {
      this.destroyPopper();
      this.initPopper();
    }
  }

  render() {
    return (
      <HiddenBox
        id={this.props.popoverId}
        {...this.state}
        data-placement={this.state.placement}
        slideDistance="1em"
        defaultSlide={this.state.placement.replace(/-.+$/, "")}
        defaultExpand={this.state.placement.replace(/-.+$/, "")}
        {...this.props}
      />
    );
  }
}

const Popover = styled(Component)`
  position: absolute;
  top: 0;
  left: 0;
  user-select: auto;
  cursor: auto;
  color: inherit;
  background-color: white;
  padding: 1em;
  z-index: 999;
  outline: 0;
  will-change: transform;
  &[aria-hidden="false"] {
    transition-timing-function: ${prop(
      "timing",
      "cubic-bezier(0.25, 0.1, 0.25, 1.5)"
    )};
  }
  ${prop("theme.Popover")};
`;

Popover.propTypes = {
  placement: PropTypes.oneOf([
    "auto",
    "top",
    "right",
    "bottom",
    "left",
    "top-start",
    "right-start",
    "bottom-start",
    "left-start",
    "top-end",
    "right-end",
    "bottom-end",
    "left-end"
  ]),
  popoverId: PropTypes.string
};

Popover.defaultProps = {
  role: "group",
  placement: "bottom",
  hideOnEsc: true
};

export default as("div")(Popover);
