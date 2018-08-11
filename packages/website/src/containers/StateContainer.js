import React from "react";
import { Container } from "reakit";

const setState = (...args) => props => {
  props.setState(...args);
};

const StateContainer = ({ effects, ...props }) => (
  <Container effects={{ setState, ...effects }} {...props} />
);

export default StateContainer;
