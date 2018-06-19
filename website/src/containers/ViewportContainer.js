import React from "react";
import { Container } from "reakit";

const getDimensions = () => ({
  width: window.innerWidth,
  height: window.innerHeight
});

const initialState = getDimensions();

const onMount = ({ setState }) => {
  const handler = () => setState(getDimensions());
  window.addEventListener("resize", handler);
  setState({ handler });
};

const onUnmount = ({ state }) => {
  window.removeEventListener("resize", state.handler);
};

const ViewportContainer = props => (
  <Container
    {...props}
    initialState={{ ...initialState, ...props.initialState }}
    onMount={onMount}
    onUnmount={onUnmount}
  />
);

export default ViewportContainer;
