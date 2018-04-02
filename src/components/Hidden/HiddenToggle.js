import React from "react";
import PropTypes from "prop-types";
import flow from "lodash/flow";
import as from "../../enhancers/as";
import Base from "../Base";

const HiddenToggle = ({ onClick, ...props }) => (
  <Base onClick={flow(onClick, props.toggle)} {...props} />
);

HiddenToggle.propTypes = {
  toggle: PropTypes.func.isRequired,
  onClick: PropTypes.func
};

HiddenToggle.defaultProps = {
  onClick: () => {}
};

export default as("button")(HiddenToggle);
