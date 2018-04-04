/* eslint-disable react/no-unused-prop-types */
import React from "react";
import PropTypes from "prop-types";
import { State } from "constate";

const toggle = () => state => ({ visible: !state.visible });
const show = () => () => ({ visible: true });
const hide = () => () => ({ visible: false });

class HiddenState extends React.Component {
  static propTypes = {
    actions: PropTypes.objectOf(PropTypes.func),
    initialState: PropTypes.object
  };

  initialState = { visible: false, ...this.props.initialState };

  actions = { toggle, show, hide, ...this.props.actions };

  render() {
    return (
      <State
        {...this.props}
        initialState={this.initialState}
        actions={this.actions}
      />
    );
  }
}

export default HiddenState;
