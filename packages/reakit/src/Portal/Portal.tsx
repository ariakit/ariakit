import * as React from "react";
import * as ReactDOM from "react-dom";
import { prop } from "styled-tools";
import hoistNonReactStatics from "hoist-non-react-statics";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

type ComponentProps = {
  as?: keyof JSX.IntrinsicElements | React.ComponentType;
  static?: boolean;
  absolute?: boolean;
  fixed?: boolean;
  relative?: boolean;
  sticky?: boolean;
};

type ComponentState = {
  wrapper?: React.ReactNode;
};

class Component extends React.Component<ComponentProps, ComponentState> {
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
