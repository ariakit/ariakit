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
    placement: this.props.placement
  };

  componentDidMount() {
    const { controller, placement } = this.props;
    const current = findDOMNode(this);
    const element =
      typeof controller === "string"
        ? findDOMNode(controller)
        : controller || current.parentNode;
    this.popper = new Popper(element, current, {
      placement,
      modifiers: {
        applyStyle: {
          enabled: false
        },
        arrow: {
          element: current.querySelector(`.${PopoverArrow.styledComponentId}`)
        },
        flip: {
          padding: 16
        },
        offset: {
          offset: "0, 16"
        },
        foo: {
          enabled: true,
          order: 900,
          fn: data => {
            const lol = current.querySelector(
              `.${PopoverArrow.styledComponentId}`
            );
            if (lol) {
              const { top, left } = data.arrowStyles;
              lol.style.top = `${top}px`;
              lol.style.left = `${left}px`;
              this.setState({
                originX: left ? `${numberToPx(left)} - 50% + 0.625em` : 0,
                originY: top ? `${numberToPx(top)} - 50% + 0.625em` : 0
              });
            }
            this.setState({
              x: data.offsets.popper.left,
              y: data.offsets.popper.top,
              placement: data.placement
            });
            return data;
          }
        }
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.visible !== this.props.visible) {
      this.popper.update();
    }
  }

  render() {
    return (
      <HiddenBox
        id={this.props.popoverId}
        {...this.props}
        data-placement={this.state.placement}
        translateX={this.state.x}
        translateY={this.state.y}
        originX={this.state.originX}
        originY={this.state.originY}
        slideDistance="1em"
        defaultSlide={this.state.placement.replace(/-.+$/, "")}
        defaultExpand={this.state.placement.replace(/-.+$/, "")}
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
