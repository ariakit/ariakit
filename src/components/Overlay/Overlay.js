import React from "react";
import ReactDOM from "react-dom";
import styled, { css } from "styled-components";
import { prop, ifProp } from "styled-tools";
import as from "../../enhancers/as";
import { hasTransition, expand, slide } from "../../utils/transitions";
import Hidden from "../Hidden";

class Component extends React.Component {
  state = {};

  componentDidMount() {
    const wrapper = document.createElement("div");
    document.body.appendChild(wrapper);
    this.setState({ wrapper });
  }

  componentWillUnmount() {
    document.body.removeChild(this.state.wrapper);
  }

  render() {
    const { wrapper } = this.state;
    if (wrapper) {
      return ReactDOM.createPortal(<Hidden {...this.props} />, wrapper);
    }
    return null;
  }
}

const Overlay = styled(Component)`
  position: fixed;
  background-color: white;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 19900410;

  ${ifProp(
    hasTransition,
    css`
      &[aria-hidden="true"] {
        transform: ${slide({ x: "-50%", y: "-50%", defaultValue: "top" })}
          ${expand()};
      }
    `
  )};

  ${prop("theme.Overlay")};
`;

Overlay.defaultProps = {
  role: "dialog",
  "aria-modal": true,
  hideOnEsc: true
};

export default as("div")(Overlay);
