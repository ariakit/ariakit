import React from "react";
import PropTypes from "prop-types";
import flow from "lodash/flow";
import as from "../../enhancers/as";
import Base from "../Base";

const show = props => () => props.show(props.step);

const StepShow = ({ onClick, ...props }) => (
  <Base onClick={flow(show(props), onClick)} {...props} />
);

StepShow.propTypes = {
  show: PropTypes.func.isRequired,
  step: PropTypes.string.isRequired,
  onClick: PropTypes.func
};

StepShow.defaultProps = {
  onClick: () => {}
};

export default as("button")(StepShow);
