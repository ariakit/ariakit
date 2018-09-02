import React from "react";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";
import { theme, palette } from "styled-tools";
import Popper from "popper.js";
import styled from "../styled";
import as from "../as";
import Hidden from "../Hidden";
import PopoverArrow from "./PopoverArrow";

class Component extends React.Component {
  state = {
    placement: this.props.placement,
    translateX: undefined,
    translateY: undefined,
    originX: undefined,
    originY: undefined
  };

  getPopover = () => findDOMNode(this);

  modifier = data => {
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
    const { placement, flip, shift } = this.props;
    const popover = this.getPopover();
    const arrowClassName = `.${PopoverArrow.styledComponentId}`;
    const arrow = popover.querySelector(arrowClassName);
    return {
      placement,
      modifiers: {
        hide: { enabled: false },
        applyStyle: { enabled: false },
        arrow: { enabled: !!arrow, element: arrow },
        flip: { enabled: flip, padding: 16 },
        shift: { enabled: shift },
        offset: { offset: `0, ${this.props.gutter}` },
        setState: {
          enabled: true,
          order: 900,
          fn: this.modifier
        }
      }
    };
  };

  initPopper = () => {
    if (!this.popper) {
      const popover = this.getPopover();
      this.popper = new Popper(popover.parentNode, popover, this.getOptions());
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
      <Hidden
        id={this.props.popoverId}
        {...this.state}
        data-placement={this.state.placement}
        defaultSlide={this.state.placement.replace(/-.+$/, "")}
        defaultExpand={this.state.placement.replace(/-.+$/, "")}
        slideOffset={this.props.gutter}
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
  z-index: 999;
  will-change: transform;
  background-color: ${palette("background", -1)};
  ${theme("Popover")};
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
  flip: PropTypes.bool,
  shift: PropTypes.bool,
  gutter: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  popoverId: PropTypes.string
};

Popover.defaultProps = {
  role: "group",
  placement: "bottom",
  hideOnEsc: true,
  flip: true,
  shift: true,
  gutter: 12
};

export default as("div")(Popover);
