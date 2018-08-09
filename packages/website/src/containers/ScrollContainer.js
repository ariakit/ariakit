import React from "react";
import { Container } from "reakit";

const getScrollPosition = element => ({
  y: element.scrollY,
  x: element.scrollX
});

const initialState = getScrollPosition(window);

const onMount = ({ setState }) => {
  const handler = () => setState(getScrollPosition(window));
  window.addEventListener("scroll", handler);
  setState({ handler });
};

const onUnmount = ({ state }) => {
  window.removeEventListener("scroll", state.handler);
};

const ScrollContainer = props => (
  <Container
    {...props}
    initialState={{ ...initialState, ...props.initialState }}
    onMount={onMount}
    onUnmount={onUnmount}
  />
);

export default ScrollContainer;
