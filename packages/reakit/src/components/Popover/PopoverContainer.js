import React from "react";
import uniqueId from "../../utils/uniqueId";
import HiddenContainer from "../Hidden/HiddenContainer";
import callAll from "../../utils/callAll";

const onMount = ({ setState }) => {
  setState({ popoverId: uniqueId("popover") });
};

const PopoverContainer = props => (
  <HiddenContainer {...props} onMount={callAll(onMount, props.onMount)} />
);

export default PopoverContainer;
