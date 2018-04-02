import React from "react";
import PropTypes from "prop-types";
import flow from "lodash/flow";
import as from "../../enhancers/as";
import Base from "../Base";

const StepPrevious = ({ onClick, ...props }) => (
  <Base
    onClick={flow(props.previous, onClick)}
    disabled={!props.loop && !props.hasPrevious()}
    {...props}
  />
);

StepPrevious.propTypes = {
  previous: PropTypes.func.isRequired,
  hasPrevious: PropTypes.func.isRequired,
  loop: PropTypes.bool,
  onClick: PropTypes.func
};

StepPrevious.defaultProps = {
  onClick: () => {}
};

export default as("button")(StepPrevious);
