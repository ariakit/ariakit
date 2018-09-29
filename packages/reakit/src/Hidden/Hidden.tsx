import * as React from "react";
import { findDOMNode } from "react-dom";
import * as PropTypes from "prop-types";
import { prop, theme, ifProp } from "styled-tools";
import hoistNonReactStatics from "hoist-non-react-statics";
import {
  hasTransition,
  translateWithProps,
  originWithProps,
  scaleWithProps,
  slideWithProps
} from "../_utils/styledProps";
import callAll from "../_utils/callAll";
import styled, { css } from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

interface MouseClickEvent extends MouseEvent {
  target: Node;
}

type Position = "top" | "right" | "bottom" | "left";

export interface HiddenProps extends BoxProps {
  visible?: boolean;
  hide?: () => void;
  onTransitionEnd?: () => void;
  hideOnEsc?: boolean;
  hideOnClickOutside?: boolean;
  unmount?: boolean;
  fade?: boolean;
  expand?: boolean | "center" | Position;
  slide?: boolean | Position;
  duration?: string;
  delay?: string;
  timing?: string;
  animated?: boolean;
  transitioning?: boolean;
  translateX?: number | string;
  translateY?: number | string;
  defaultSlide?: boolean | Position;
}

interface HiddenState {
  visible?: boolean;
  transitioning?: boolean;
}

class Component extends React.Component<HiddenProps, HiddenState> {
  state = {
    visible: this.props.visible,
    transitioning: this.props.transitioning
  };

  componentDidMount() {
    const { hideOnEsc, hideOnClickOutside } = this.props;

    if (hideOnEsc) {
      document.body.addEventListener("keydown", this.handleKeyDown);
    }

    if (hideOnClickOutside) {
      document.body.addEventListener("click", this.handleClickOutside);
    }
  }

  applyState = () => {
    const { visible, unmount } = this.props;

    if (typeof window !== "undefined" && unmount && hasTransition(this.props)) {
      if (visible) {
        this.setState({ transitioning: true });
        requestAnimationFrame(() =>
          // it may be still transitioning, but it doesn't matter
          // we just need to set it to false in another loop
          this.setState({ transitioning: false, visible: true })
        );
      } else {
        this.setState({ visible: false, transitioning: true });
      }
    } else {
      this.setState({ visible });
    }
  };

  componentDidUpdate(prevProps: HiddenProps) {
    if (prevProps.visible !== this.props.visible) {
      this.applyState();
    }
  }

  componentWillUnmount() {
    document.body.removeEventListener("keydown", this.handleKeyDown);
    document.body.removeEventListener("click", this.handleClickOutside);
  }

  handleTransitionEnd = () => {
    const { visible, unmount } = this.props;
    if (unmount && !visible) {
      // at this point, this is the last state left to return null on render
      this.setState({ transitioning: false });
    }
  };

  handleKeyDown = (e: KeyboardEvent) => {
    const { visible, hide } = this.props;
    if (e.key === "Escape" && visible && hide) {
      hide();
    }
  };

  handleClickOutside = (e: MouseEvent) => {
    const node = findDOMNode(this);
    const { hide, visible } = this.props;
    const shouldHide =
      node instanceof Element &&
      !node.contains((e as MouseClickEvent).target) &&
      visible &&
      hide;

    if (shouldHide) {
      // it's possible that the outside click was on a toggle button
      // in that case, we should "wait" before hiding it
      // otherwise it could hide before and then toggle, showing it again
      setTimeout(() => this.props.visible && hide && hide());
    }
  };

  render() {
    const { unmount, onTransitionEnd } = this.props;
    const { visible, transitioning } = this.state;

    if (unmount && !visible && !transitioning) {
      return null;
    }

    return (
      <Box
        aria-hidden={!visible}
        hidden={!visible && !hasTransition(this.props)}
        {...this.props}
        {...this.state}
        onTransitionEnd={callAll(this.handleTransitionEnd, onTransitionEnd)}
      />
    );
  }
}

hoistNonReactStatics(Component, Box);

const Hidden = styled(Component)`
  transform: ${translateWithProps};
  ${ifProp(
    hasTransition,
    css`
      transform-origin: ${originWithProps};
      transition: all ${prop("duration")} ${prop("timing")} ${prop("delay")};
    `
  )};

  &[aria-hidden="true"] {
    pointer-events: none;

    ${ifProp("fade", "opacity: 0")};

    ${ifProp(
      hasTransition,
      css`
        transform: ${slideWithProps} ${scaleWithProps};
        visibility: hidden;
        will-change: transform opacity;
      `,
      "display: none !important"
    )};
  }

  ${theme("Hidden")};
`;

// @ts-ignore
Hidden.propTypes = {
  visible: PropTypes.bool,
  hide: PropTypes.func,
  hideOnEsc: PropTypes.bool,
  hideOnClickOutside: PropTypes.bool,
  unmount: PropTypes.bool,
  fade: PropTypes.bool,
  expand: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.oneOf(["center", "top", "right", "bottom", "left"])
  ]),
  slide: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.oneOf(["top", "right", "bottom", "left"])
  ]),
  duration: PropTypes.string,
  delay: PropTypes.string,
  timing: PropTypes.string,
  animated: PropTypes.bool
};

Hidden.defaultProps = {
  duration: "250ms",
  timing: "ease-in-out"
};

export default as("div")(Hidden);
