import * as React from "react";
import * as ReactDOM from "react-dom";
import { theme } from "styled-tools";
import hoist from "../_utils/hoist";
import styled from "../styled";
import use from "../use";
import Box, { BoxProps } from "../Box";

export interface PortalProps extends BoxProps {}

interface PortalState {
  wrapper?: React.ReactNode;
}

class PortalComponent extends React.Component<PortalProps, PortalState> {
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

const Portal = styled(hoist(PortalComponent, Box))`
  ${theme("Portal")};
`;

export default use(Portal, "div");
