import React from "react";
import PropTypes from "prop-types";
import StepContainer from "../Step/StepContainer";

const TabsContainer = ({ initialState, ...props }) => (
  <StepContainer
    {...props}
    initialState={{ loop: true, current: 0, ...initialState }}
  />
);

TabsContainer.propTypes = {
  initialState: PropTypes.object
};

export default TabsContainer;
