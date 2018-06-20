import React from "react";
import PropTypes from "prop-types";
import styled, { css } from "styled-components";
import { prop } from "styled-tools";
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
    const { visible, destroy } = this.props;

    if (destroy) {
      return visible ? <Base {...this.props} /> : null;
    }

    return <Base aria-hidden={!visible} hidden={!visible} {...this.props} />;
  }
}

hoistNonReactStatics(Component, Base);

/**
 * Gets the css method for hiding the element based on the requested styleProp
 * @param {'visibility' | 'opacity' | 'display'} styleProp
 */
const hiddenCssForStyleProp = styleProp => {
  switch (styleProp) {
    case "visibility":
      return css`
        visibility: hidden !important;
      `;
    case "opacity":
      return css`
        opacity: 0 !important;
      `;
    default:
      return css`
        display: none !important;
      `;
  }
};

const Hidden = styled(Component)`
  ${props => !props.visible && hiddenCssForStyleProp(props.styleProp)};
  ${prop("theme.Hidden")};
`;

Hidden.propTypes = {
  hide: PropTypes.func,
  hideOnEsc: PropTypes.bool,
  visible: PropTypes.bool,
  destroy: PropTypes.bool,
  styleProp: PropTypes.oneOf(["display", "visibility", "opacity"])
};

export default as("div")(Hidden);
