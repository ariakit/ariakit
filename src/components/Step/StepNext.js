import React from "react";
import PropTypes from "prop-types";
import as from "../../enhancers/as";
import Base from "../Base";
import callAll from "../../utils/callAll";

const StepNext = ({ onClick, ...props }) => (
  <Base
    onClick={callAll(props.next, onClick)}
    disabled={!props.loop && props.hasNext && !props.hasNext()}
    {...props}
  />
);

StepNext.propTypes = {
  next: PropTypes.func.isRequired,
  hasNext: PropTypes.func.isRequired,
  loop: PropTypes.bool,
  onClick: PropTypes.func
};

export default as("button")(StepNext);
