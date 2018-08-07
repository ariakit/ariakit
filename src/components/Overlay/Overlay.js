import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Hidden from "../Hidden";

class Component extends React.Component {
  state = { wrapper: null };

  componentDidMount() {
    const wrapper = document.createElement("div");
    document.body.appendChild(wrapper);
    this.setState({ wrapper });
  }

  componentWillUnmount() {
    if (this.state.wrapper) {
      document.body.removeChild(this.state.wrapper);
    }
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
  z-index: 19900410;
  ${prop("theme.Overlay")};
`;

Overlay.defaultProps = {
  role: "dialog",
  "aria-modal": true,
  hideOnEsc: true,
  translateX: "-50%",
  translateY: "-50%",
  defaultSlide: "top"
};

export default as("div")(Overlay);
