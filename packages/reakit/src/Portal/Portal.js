import React from "react";
import ReactDOM from "react-dom";
import { prop } from "styled-tools";
import hoistNonReactStatics from "hoist-non-react-statics";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

class Component extends React.Component {
  state = { wrapper: null };

  componentDidMount() {
    const wrapper = document.createElement("div");
    document.body.appendChild(wrapper);
    this.setState({ wrapper });
  }

  componentWillUnmount() {
    const { wrapper } = this.state;
    if (wrapper) {
      document.body.removeChild(wrapper);
    }
  }

  render() {
    const { wrapper } = this.state;
    if (wrapper) {
      return ReactDOM.createPortal(<Base {...this.props} />, wrapper);
    }
    return null;
  }
}

hoistNonReactStatics(Component, Base);

const Portal = styled(Component)`
  ${prop("theme.Portal")};
`;

export default as("div")(Portal);
