import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

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
      return ReactDOM.createPortal(<Base {...this.props} />, wrapper);
    }
    return null;
  }
}

const Portal = styled(Component)`
  ${prop("theme.Portal")};
`;

export default as("div")(Portal);
