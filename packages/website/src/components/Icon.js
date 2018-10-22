import React from "react";
import PropTypes from "prop-types";

const Icon = ({ use: T, ...props }) => (
  <div>
    <T width="1.5em" height="1.5em" {...props} />
  </div>
);

Icon.propTypes = {
  use: PropTypes.func.isRequired
};

export default Icon;
