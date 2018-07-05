import React from "react";
import PropTypes from "prop-types";

const Icon = ({ as: T, ...props }) => (
  <T width="1.5em" height="1.5em" {...props} />
);

Icon.propTypes = {
  as: PropTypes.func.isRequired
};

export default Icon;
