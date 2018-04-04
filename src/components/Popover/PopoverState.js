/* eslint-disable react/prefer-stateless-function */
import React from "react";
import PropTypes from "prop-types";
import uniqueId from "lodash/uniqueId";
import HiddenState from "../Hidden/HiddenState";

class PopoverState extends React.Component {
  static propTypes = {
    initialState: PropTypes.object
  };

  initialState = { popoverId: uniqueId("popover"), ...this.props.initialState };

  render() {
    return <HiddenState {...this.props} initialState={this.initialState} />;
  }
}

export default PopoverState;
