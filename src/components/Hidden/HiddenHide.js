import React from "react";
import PropTypes from "prop-types";
import flow from "lodash/flow";
import as from "../../enhancers/as";
import Base from "../Base";

const HiddenHide = ({ onClick, ...props }) => (
  <Base onClick={flow(onClick, props.hide)} {...props} />
);

HiddenHide.propTypes = {
  hide: PropTypes.func.isRequired,
  onClick: PropTypes.func
};

HiddenHide.defaultProps = {
  onClick: () => {}
};

export default as("button")(HiddenHide);
