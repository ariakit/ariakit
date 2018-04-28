import React from "react";
import PropTypes from "prop-types";
import StepContainer from "../Step/StepContainer";

export const initialState = {
  loop: true,
  current: 0
};

// istanbul ignore next
const TabsContainer = props => (
  <StepContainer
    {...props}
    initialState={{ ...initialState, ...props.initialState }}
  />
);

TabsContainer.propTypes = {
  initialState: PropTypes.object
};

export default TabsContainer;
