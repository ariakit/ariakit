import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import as from "../../enhancers/as";
import Hidden from "../Hidden";
import Box from "../Box";

const HiddenBox = Hidden.as(Box);

class Component extends React.Component {
  componentDidMount() {
    document.body.appendChild(this.container);
  }

  componentWillUnmount() {
    document.body.removeChild(this.container);
  }

  container = document && document.createElement("div");

  render() {
    return ReactDOM.createPortal(<HiddenBox {...this.props} />, this.container);
  }
}

const Overlay = styled(Component)`
  position: fixed;
  background-color: white;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
`;

Overlay.defaultProps = {
  role: "dialog",
  "aria-modal": true,
  hideOnEsc: true
};

export default as("div")(Overlay);
