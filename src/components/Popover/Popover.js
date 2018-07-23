/* eslint-disable react/no-find-dom-node */
import React from "react";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";
import styled from "styled-components";
import { prop } from "styled-tools";
import Popper from "popper.js";
import as from "../../enhancers/as";
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
      : controller || this.getPopover().parentNode;
  };

  getPopover = () => findDOMNode(this);

  modifierFn = data => {
    const { placement, offsets, arrowElement, arrowStyles } = data;
    const { reference, popper } = offsets;
    const [position] = placement.split("-");
    const isVertical = ["top", "bottom"].indexOf(position) >= 0;

    const referenceCenter = isVertical
      ? reference.width / 2
      : reference.height / 2;
    const side = isVertical ? "left" : "top";
    const sideValue = referenceCenter - popper[side];

    if (arrowElement) {
      const { top, left } = arrowStyles;
      arrowElement.style.top = isVertical ? "" : `${top}px`;
      arrowElement.style.left = isVertical ? `${left}px` : "";
    }

    this.setState({
      originX: isVertical ? `${sideValue}px - 50%` : 0,
      originY: !isVertical ? `${sideValue}px - 50%` : 0,
      translateX: popper.left,
      translateY: popper.top,
      placement: data.placement
    });

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
        offset: { offset: `0, ${this.props.offset}` },
        setState: {
          enabled: true,
          order: 900,
          fn: this.modifierFn
        }
      }
    };
  };

  initPopper = () => {
    if (!this.popper) {
      this.popper = new Popper(
        this.getReference(),
        this.getPopover(),
        this.getOptions()
      );
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

  componentWillUnmount() {
    this.destroyPopper();
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
        defaultSlide={this.state.placement.replace(/-.+$/, "")}
        defaultExpand={this.state.placement.replace(/-.+$/, "")}
        slideOffset={this.props.offset}
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
  controller: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.instanceOf(Element)
  ]),
  offset: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  popoverId: PropTypes.string
};

Popover.defaultProps = {
  role: "group",
  placement: "bottom",
  hideOnEsc: true,
  offset: 12
};

export default as("div")(Popover);
