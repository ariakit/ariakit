import React from "react";
import callAll from "../_utils/callAll";
import uniqueId from "../_utils/uniqueId";
import HiddenContainer from "../Hidden/HiddenContainer";

const onMount = ({ setState }) => {
  setState({ popoverId: uniqueId("popover") });
};

const PopoverContainer = props => (
  <HiddenContainer {...props} onMount={callAll(onMount, props.onMount)} />
);

export default PopoverContainer;
