import React from "react";
import PropTypes from "prop-types";
import StepState from "../Step/StepState";

class TabsState extends React.Component {
  static propTypes = {
    initialState: PropTypes.object
  };

  initialState = {
    loop: true,
    current: 0,
    ...this.props.initialState
  };

  render() {
    return <StepState {...this.props} initialState={this.initialState} />;
  }
}

export default TabsState;
