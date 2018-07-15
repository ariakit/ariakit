import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { prop, ifProp, ifNotProp, switchProp } from "styled-tools";
import hoistNonReactStatics from "hoist-non-react-statics";
import as from "../../enhancers/as";
import callAll from "../../utils/callAll";
import Base from "../Base";

class Component extends React.Component {
  state = {
    visible: this.props.visible,
    transitioning: this.props.transitioning
  };

  componentDidMount() {
    const { visible, hideOnEsc } = this.props;
    if (visible && hideOnEsc) {
      document.body.addEventListener("keydown", this.handleKeyDown);
    }
  }

  applyState = () => {
    const { fade, slide, expand, visible, unmount } = this.props;

    const hasTransition = fade || slide || expand;

    if (unmount && hasTransition) {
      if (visible) {
        this.setState({ transitioning: true });
        setTimeout(() =>
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
    const { visible, hideOnEsc } = this.props;

    if (prevProps.visible !== visible) {
      this.applyState();

      if (hideOnEsc) {
        const addOrRemove = visible
          ? "addEventListener"
          : "removeEventListener";
        document.body[addOrRemove]("keydown", this.handleKeyDown);
      }
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
    if (e.key === "Escape" && this.props.hide) {
      this.props.hide();
    }
  };

  render() {
    const { className, unmount, onTransitionEnd } = this.props;
    const { visible, transitioning } = this.state;

    if (unmount && !visible && !transitioning) {
      return null;
    }

    const visibleClassName = visible && "visible";
    const finalClassName = [className, visibleClassName]
      .filter(Boolean)
      .join(" ");

    return (
      <Base
        aria-hidden={!visible}
        {...this.props}
        {...this.state}
        className={finalClassName}
        onTransitionEnd={callAll(this.handleTransitionEnd, onTransitionEnd)}
      />
    );
  }
}

hoistNonReactStatics(Component, Base);

const Hidden = styled(Component)`
  transition: opacity ${prop("duration")} ${prop("timing")},
    transform ${prop("duration")} ${prop("timing")};
  ${ifProp(
    "expand",
    switchProp("expand", {
      top: "transform-origin: 50% 100%",
      right: "transform-origin: 0 50%",
      bottom: "transform-origin: 50% 0",
      left: "transform-origin: 100% 50%"
    })
  )};
  &:not(.visible) {
    pointer-events: none;
    ${ifProp(
      props => !props.fade && !props.slide && !props.expand,
      "display: none !important"
    )};
    ${ifProp("fade", "opacity: 0")};
    transform: ${ifProp("expand", "scale(0)")}
      ${ifProp(
        "slide",
        switchProp(prop("slide", "right"), {
          top: "translateY(100%)",
          right: "translateX(-100%)",
          bottom: "translateY(-100%)",
          left: "translateX(100%)"
        })
      )};
  }

  ${prop("theme.Hidden")};
`;

Hidden.propTypes = {
  visible: PropTypes.bool,
  hide: PropTypes.func,
  hideOnEsc: PropTypes.bool,
  duration: PropTypes.string,
  timing: PropTypes.string,
  unmount: PropTypes.oneOfType([PropTypes.bool, PropTypes.number])
};

Hidden.defaultProps = {
  duration: "200ms",
  timing: "ease-in-out"
};

export default as("div")(Hidden);
