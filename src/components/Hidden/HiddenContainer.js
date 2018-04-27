/* eslint-disable react/no-unused-prop-types */
import React from "react";
import PropTypes from "prop-types";
import { Container } from "constate";

const toggle = () => state => ({ visible: !state.visible });
const show = () => () => ({ visible: true });
const hide = () => () => ({ visible: false });

const HiddenContainer = ({ initialState, actions, ...props }) => (
  <Container
    {...props}
    initialState={{ visible: false, ...initialState }}
    actions={{ toggle, show, hide, ...actions }}
  />
);

HiddenContainer.propTypes = {
  initialState: PropTypes.object,
  actions: PropTypes.objectOf(PropTypes.func)
};

export default HiddenContainer;
