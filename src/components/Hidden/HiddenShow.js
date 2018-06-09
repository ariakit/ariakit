import React from "react";
import PropTypes from "prop-types";
import as from "../../enhancers/as";
import callAll from "../../utils/callAll";
import Base from "../Base";

const HiddenShow = ({ onClick, ...props }) => (
  <Base onClick={callAll(props.show, onClick)} {...props} />
);

HiddenShow.propTypes = {
  show: PropTypes.func.isRequired,
  onClick: PropTypes.func
};

export default as("button")(HiddenShow);
