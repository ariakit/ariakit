import React from "react";
import PropTypes from "prop-types";
import { Container } from "constate";

export const initialState = { visible: false };

export const toggle = () => state => ({ visible: !state.visible });

export const show = () => () => ({ visible: true });

export const hide = () => () => ({ visible: false });

const HiddenContainer = props => (
  <Container
    {...props}
    initialState={{ ...initialState, ...props.initialState }}
    actions={{ toggle, show, hide, ...props.actions }}
  />
);

HiddenContainer.propTypes = {
  initialState: PropTypes.object,
  actions: PropTypes.objectOf(PropTypes.func)
};

export default HiddenContainer;
