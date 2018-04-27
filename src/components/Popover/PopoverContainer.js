/* eslint-disable react/prefer-stateless-function */
import React from "react";
import PropTypes from "prop-types";
import uniqueId from "lodash/uniqueId";
import HiddenContainer from "../Hidden/HiddenContainer";

class PopoverContainer extends React.Component {
  static propTypes = {
    initialState: PropTypes.object
  };

  popoverId = uniqueId("popover");

  render() {
    return (
      <HiddenContainer
        {...this.props}
        initialState={{ popoverId: this.popoverId, ...this.props.initialState }}
      />
    );
  }
}

export default PopoverContainer;
