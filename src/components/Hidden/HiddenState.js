/* eslint-disable react/no-unused-prop-types */
import React from "react";
import PropTypes from "prop-types";
import { State } from "constate";

const toggle = () => state => ({ visible: !state.visible });
const show = () => () => ({ visible: true });
const hide = () => () => ({ visible: false });

const HiddenState = ({ initialState, actions, ...props }) => (
  <State
    {...props}
    initialState={{ visible: false, ...initialState }}
    actions={{ toggle, show, hide, ...actions }}
  />
);

HiddenState.propTypes = {
  initialState: PropTypes.object,
  actions: PropTypes.objectOf(PropTypes.func)
};

export default HiddenState;
