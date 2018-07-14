import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { prop, ifNotProp } from "styled-tools";
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
    const { hasTransition, visible, unmount } = this.props;

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
  &:not(.visible) {
    pointer-events: none;
    ${ifNotProp("hasTransition", "display: none !important")};
  }

  ${prop("theme.Hidden")};
`;

Hidden.propTypes = {
  visible: PropTypes.bool,
  hide: PropTypes.func,
  hideOnEsc: PropTypes.bool,
  hasTransition: PropTypes.bool,
  unmount: PropTypes.oneOfType([PropTypes.bool, PropTypes.number])
};

export default as("div")(Hidden);
