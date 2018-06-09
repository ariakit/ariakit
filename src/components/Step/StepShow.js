import React from "react";
import PropTypes from "prop-types";
import as from "../../enhancers/as";
import callAll from "../../utils/callAll";
import Base from "../Base";

const show = props => () => props.show && props.show(props.step);

const StepShow = ({ onClick, ...props }) => (
  <Base onClick={callAll(show(props), onClick)} {...props} />
);

StepShow.propTypes = {
  show: PropTypes.func.isRequired,
  step: PropTypes.string.isRequired,
  onClick: PropTypes.func
};

export default as("button")(StepShow);
