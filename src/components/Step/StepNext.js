import React from "react";
import PropTypes from "prop-types";
import flow from "lodash/flow";
import as from "../../enhancers/as";
import Base from "../Base";

const StepNext = ({ onClick, ...props }) => (
  <Base
    onClick={flow(props.next, onClick)}
    disabled={!props.loop && !props.hasNext()}
    {...props}
  />
);

StepNext.propTypes = {
  next: PropTypes.func.isRequired,
  hasNext: PropTypes.func.isRequired,
  loop: PropTypes.bool,
  onClick: PropTypes.func
};

StepNext.defaultProps = {
  onClick: () => {}
};

export default as("button")(StepNext);
