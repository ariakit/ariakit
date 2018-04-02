import React from "react";
import PropTypes from "prop-types";
import flow from "lodash/flow";
import as from "../../enhancers/as";
import Base from "../Base";

const toggle = props => () => props.toggle(props.step);

const StepToggle = ({ onClick, ...props }) => (
  <Base onClick={flow(toggle(props), onClick)} {...props} />
);

StepToggle.propTypes = {
  toggle: PropTypes.func.isRequired,
  step: PropTypes.string.isRequired,
  onClick: PropTypes.func
};

StepToggle.defaultProps = {
  onClick: () => {}
};

export default as("button")(StepToggle);
