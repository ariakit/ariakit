import React from "react";
import ReactDOM from "react-dom";
import styled, { css } from "styled-components";
import { prop, ifProp, switchProp } from "styled-tools";
import as from "../../enhancers/as";
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

  &:not(.visible) {
    ${ifProp(
      props => props.expand || props.slide,
      css`
        transform: ${ifProp(
            "expand",
            switchProp("expand", {
              top: "scaleY(0)",
              right: "scaleX(0)",
              bottom: "scaleY(0)",
              left: "scaleX(0)",
              undefined: "scale(0)"
            })
          )}
          ${ifProp(
            "slide",
            switchProp(prop("slide", "top"), {
              top: "translate(-50%, 50%)",
              right: "translate(-150%, -50%)",
              bottom: "translate(-50%, -150%)",
              left: "translate(50%, -50%)"
            })
          )};
      `
    )};
  }

  ${prop("theme.Overlay")};
`;

Overlay.defaultProps = {
  role: "dialog",
  "aria-modal": true,
  hideOnEsc: true
};

export default as("div")(Overlay);
