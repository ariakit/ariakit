import * as React from "react";
import * as ReactDOM from "react-dom";
import { theme } from "styled-tools";
import hoistNonReactStatics from "hoist-non-react-statics";
import styled from "../styled";
import as from "../as";
import Box from "../Box";
import { BoxProps } from "../Box/Box";

type ComponentState = {
  wrapper?: React.ReactNode;
};

class Component extends React.Component<BoxProps, ComponentState> {
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
      return ReactDOM.createPortal(<Box {...this.props} />, wrapper);
    }
    return null;
  }
}

hoistNonReactStatics(Component, Box);

const Portal = styled(Component)`
  ${theme("Portal")};
`;

export default as("div")(Portal);
