import * as React from "react";
import * as ReactDOM from "react-dom";
import { theme } from "styled-tools";
import hoistNonReactStatics from "hoist-non-react-statics";
import styled from "../styled";
import as from "../as";
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

hoistNonReactStatics(PortalComponent, Box);

const Portal = styled(PortalComponent)`
  ${theme("Portal")};
`;

export default as("div")(Portal);
