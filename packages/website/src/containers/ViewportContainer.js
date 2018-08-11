import React from "react";
import { Container } from "reakit";

class ViewportContainer extends React.Component {
  getDimensions = () => ({
    width: window.innerWidth,
    height: window.innerHeight
  });

  initialState = this.getDimensions();

  onMount = ({ setState }) => {
    this.handler = () => setState(this.getDimensions());
    window.addEventListener("resize", this.handler);
  };

  onUnmount = () => {
    window.removeEventListener("resize", this.handler);
  };

  render() {
    return (
      <Container
        {...this.props}
        initialState={{ ...this.initialState, ...this.props.initialState }}
        onMount={this.onMount}
        onUnmount={this.onUnmount}
      />
    );
  }
}

export default ViewportContainer;
