import React from "react";
import PropTypes from "prop-types";
import as from "../../enhancers/as";
import callAll from "../../utils/callAll";
import Base from "../Base";

const HiddenHide = ({ onClick, ...props }) => (
  <Base onClick={callAll(props.hide, onClick)} {...props} />
);

HiddenHide.propTypes = {
  hide: PropTypes.func.isRequired,
  onClick: PropTypes.func
};

export default as("button")(HiddenHide);
