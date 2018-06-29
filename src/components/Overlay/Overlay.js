import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Hidden from "../Hidden";

class Component extends React.Component {
  componentDidMount() {
    document.body.appendChild(this.wrapper);
  }

  componentWillUnmount() {
    document.body.removeChild(this.wrapper);
  }

  wrapper = document && document.createElement("div");

  render() {
    return ReactDOM.createPortal(<Hidden {...this.props} />, this.wrapper);
  }
}

const Overlay = styled(Component)`
  position: fixed;
  background-color: white;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 19900410;
  ${prop("theme.Overlay")};
`;

Overlay.defaultProps = {
  role: "dialog",
  "aria-modal": true,
  hideOnEsc: true
};

export default as("div")(Overlay);
