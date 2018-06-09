import React from "react";
import PropTypes from "prop-types";
import as from "../../enhancers/as";
import callAll from "../../utils/callAll";
import Base from "../Base";

const StepPrevious = ({ onClick, ...props }) => (
  <Base
    onClick={callAll(props.previous, onClick)}
    disabled={!props.loop && props.hasPrevious && !props.hasPrevious()}
    {...props}
  />
);

StepPrevious.propTypes = {
  previous: PropTypes.func.isRequired,
  hasPrevious: PropTypes.func.isRequired,
  loop: PropTypes.bool,
  onClick: PropTypes.func
};

export default as("button")(StepPrevious);
