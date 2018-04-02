import React from "react";
import PropTypes from "prop-types";
import styled, { css } from "styled-components";
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

const Hidden = styled(Component)`
  ${props =>
    !props.visible &&
    css`
      display: none !important;
    `};
`;

Hidden.propTypes = {
  hide: PropTypes.func,
  hideOnEsc: PropTypes.bool,
  visible: PropTypes.bool,
  destroy: PropTypes.bool
};

export default as("div")(Hidden);
