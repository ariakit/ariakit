import React from "react";
import PropTypes from "prop-types";
import as from "../../enhancers/as";
import Hidden from "../Hidden";

const PopoverToggle = props => (
  <Hidden.Toggle
    aria-expanded={props.visible}
    aria-controls={props.popoverId}
    aria-haspopup
    {...props}
  />
);

PopoverToggle.propTypes = {
  popoverId: PropTypes.string.isRequired,
  visible: PropTypes.bool
};

export default as("button")(PopoverToggle);
