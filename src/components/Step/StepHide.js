import React from "react";
import PropTypes from "prop-types";
import as from "../../enhancers/as";
import callAll from "../../utils/callAll";
import Base from "../Base";

const StepHide = ({ onClick, ...props }) => (
  <Base onClick={callAll(props.hide, onClick)} {...props} />
);

StepHide.propTypes = {
  hide: PropTypes.func.isRequired,
  onClick: PropTypes.func
};

export default as("button")(StepHide);
