import React from "react";
import PropTypes from "prop-types";
import StepState from "../Step/StepState";

const TabsState = ({ initialState, ...props }) => (
  <StepState
    {...props}
    initialState={{ loop: true, current: 0, ...initialState }}
  />
);

TabsState.propTypes = {
  initialState: PropTypes.object
};

export default TabsState;
