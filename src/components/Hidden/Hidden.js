import React from "react";
import PropTypes from "prop-types";
import styled, { css } from "styled-components";
import { prop, ifProp } from "styled-tools";
import hoistNonReactStatics from "hoist-non-react-statics";
import as from "../../enhancers/as";
import callAll from "../../utils/callAll";
import {
  hasTransition,
  translateWithProps,
  originWithProps,
  expandWithProps,
  slideWithProps
} from "../../utils/transform";
import Base from "../Base";

class Component extends React.Component {
  state = {
    visible: this.props.visible,
    transitioning: this.props.transitioning
  };

  componentDidMount() {
    if (this.props.hideOnEsc) {
      document.body.addEventListener("keydown", this.handleKeyDown);
    }
  }

  applyState = () => {
    const { visible, unmount } = this.props;

    if (typeof window !== "undefined" && unmount && hasTransition(this.props)) {
      if (visible) {
        this.setState({ transitioning: true });
        window.requestAnimationFrame(() =>
          this.setState({ transitioning: false, visible: true })
        );
      } else {
        this.setState({ visible: false, transitioning: true });
      }
    } else {
      this.setState({ visible });
    }
  };

  componentDidUpdate(prevProps) {
    if (prevProps.visible !== this.props.visible) {
      this.applyState();
    }
  }

  componentWillUnmount() {
    document.body.removeEventListener("keydown", this.handleKeyDown);
  }

  handleTransitionEnd = () => {
    const { visible, unmount } = this.props;
    if (!visible && unmount) {
      this.setState({ transitioning: false });
    }
  };

  handleKeyDown = e => {
    const { visible, hide } = this.props;
    if (e.key === "Escape" && visible && hide) {
      hide();
    }
  };

  render() {
    const { unmount, onTransitionEnd } = this.props;
    const { visible, transitioning } = this.state;

    if (unmount && !visible && !transitioning) {
      return null;
    }

    return (
      <Base
        aria-hidden={!visible}
        {...this.props}
        {...this.state}
        onTransitionEnd={callAll(this.handleTransitionEnd, onTransitionEnd)}
      />
    );
  }
}

hoistNonReactStatics(Component, Base);

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
        transform: ${slideWithProps} ${expandWithProps};
        visibility: hidden;
      `,
      "display: none !important"
    )};
  }

  ${prop("theme.Hidden")};
`;

Hidden.propTypes = {
  visible: PropTypes.bool,
  hide: PropTypes.func,
  hideOnEsc: PropTypes.bool,
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
