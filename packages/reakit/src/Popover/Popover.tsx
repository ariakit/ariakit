import * as React from "react";
import { findDOMNode } from "react-dom";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import s from "styled-selector";
import Popper from "popper.js";
import hoist from "../_utils/hoist";
import styled from "../styled";
import use from "../use";
import Hidden, { Position, HiddenProps } from "../Hidden";
import PopoverArrow from "./PopoverArrow";

export interface PopoverProps extends HiddenProps {
  hideOnEsc?: boolean;
  placement?: Popper.Placement;
  flip?: boolean;
  shift?: boolean;
  gutter?: number | string;
  popoverId?: string;
}

export interface PopoverState {
  placement?: Popper.Placement;
  translateX?: number | string;
  translateY?: number | string;
  originX?: number | string;
  originY?: number | string;
}

class PopoverComponent extends React.Component<PopoverProps, PopoverState> {
  state = {
    placement: this.props.placement,
    translateX: undefined,
    translateY: undefined,
    originX: undefined,
    originY: undefined
  };

  private popper?: Popper;

  private getPopover = () => findDOMNode(this) as NodeSelector & Node & Element;

  private modifier = (data: Popper.Data) => {
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
      (arrowElement as any).style.top = isVertical ? "" : `${top}px`;
      (arrowElement as any).style.left = isVertical ? `${left}px` : "";
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

  getOptions = (): Popper.PopperOptions => {
    const { placement, flip, shift } = this.props;
    const popover = this.getPopover();
    const arrow = popover.querySelector(s(PopoverArrow));
    return {
      placement,
      modifiers: {
        hide: { enabled: false },
        applyStyle: { enabled: false },
        arrow: arrow ? { enabled: !!arrow, element: arrow } : undefined,
        flip: { enabled: flip, padding: 16 },
        shift: { enabled: shift },
        offset: { offset: `0, ${this.props.gutter}` },
        setState: {
          order: 900,
          enabled: true,
          fn: this.modifier
        }
      }
    };
  };

  initPopper = () => {
    if (!this.popper) {
      const popover = this.getPopover();
      if (popover.parentNode) {
        this.popper = new Popper(
          popover.parentNode as Element,
          popover,
          this.getOptions()
        );
      }
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

  componentDidUpdate(
    prevProps: PopoverProps & Readonly<{ children?: React.ReactNode }>
  ) {
    if (
      prevProps.visible !== this.props.visible ||
      prevProps.placement !== this.props.placement ||
      prevProps.children !== this.props.children
    ) {
      this.destroyPopper();
      this.initPopper();
    }
  }

  private getDefaultPlacement() {
    const { placement } = this.state;
    if (placement) {
      return placement.replace(/-.+$/, "") as Position;
    }
    return undefined;
  }

  render() {
    const defaultPlacement = this.getDefaultPlacement();
    return (
      <Hidden
        id={this.props.popoverId}
        {...this.state}
        data-placement={this.state.placement}
        defaultSlide={defaultPlacement}
        defaultExpand={defaultPlacement}
        slideOffset={this.props.gutter}
        {...this.props}
        unmount={false}
      />
    );
  }
}

const Popover = styled(hoist(PopoverComponent, Hidden))`
  position: absolute;
  top: 0;
  left: 0;
  user-select: auto;
  cursor: auto;
  z-index: 999;
  ${theme("Popover")};
`;

// @ts-ignore
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
  gutter: 12,
  opaque: true,
  palette: "white"
};

export default use(Popover, "div");
