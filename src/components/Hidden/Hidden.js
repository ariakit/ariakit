import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { prop, ifNotProp, switchProp } from "styled-tools";
import hoistNonReactStatics from "hoist-non-react-statics";
import as from "../../enhancers/as";
import Base from "../Base";

class Component extends React.Component {
  componentDidMount() {
    const { visible, hideOnEsc } = this.props;
    if (visible && hideOnEsc) {
      document.body.addEventListener("keydown", this.handleKeyDown);
    }
  }

  componentDidUpdate(prevProps) {
    const { visible, hideOnEsc } = this.props;
    if (prevProps.visible !== visible && hideOnEsc) {
      const addOrRemove = visible ? "addEventListener" : "removeEventListener";
      document.body[addOrRemove]("keydown", this.handleKeyDown);
    }
  }

  handleKeyDown = e => {
    if (e.key === "Escape" && this.props.hide) {
      this.props.hide();
    }
  };

  render() {
    const { visible, styleProp, unmount } = this.props;

    if (unmount) {
      return visible ? <Base {...this.props} /> : null;
    }

    return (
      <Base
        aria-hidden={!visible}
        hidden={!visible && styleProp === "display"}
        {...this.props}
      />
    );
  }
}

hoistNonReactStatics(Component, Base);

const Hidden = styled(Component)`
  ${ifNotProp(
    "visible",
    switchProp("styleProp", {
      visibility: "visibility: hidden !important",
      opacity: "opacity: 0 !important",
      display: "display: none !important"
    })
  )};
  ${prop("theme.Hidden")};
`;

Hidden.propTypes = {
  hide: PropTypes.func,
  hideOnEsc: PropTypes.bool,
  visible: PropTypes.bool,
  unmount: PropTypes.bool,
  styleProp: PropTypes.oneOf(["display", "visibility", "opacity"])
};

Hidden.defaultProps = {
  styleProp: "display"
};

export default as("div")(Hidden);
