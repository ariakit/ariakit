import React from "react";
import PropTypes from "prop-types";
import as from "../../enhancers/as";
import callAll from "../../utils/callAll";
import Base from "../Base";

const HiddenToggle = ({ onClick, ...props }) => (
  <Base onClick={callAll(props.toggle, onClick)} {...props} />
);

HiddenToggle.propTypes = {
  toggle: PropTypes.func.isRequired,
  onClick: PropTypes.func
};

export default as("button")(HiddenToggle);
