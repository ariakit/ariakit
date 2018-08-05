import React from "react";
import HiddenContainer from "../Hidden/HiddenContainer";
import callAll from "../../utils/callAll";
import { uniqueId } from "../../utils/lodash-like";

const onMount = ({ setState }) => {
  setState({ popoverId: uniqueId("popover") });
};

const PopoverContainer = props => (
  <HiddenContainer {...props} onMount={callAll(onMount, props.onMount)} />
);

export default PopoverContainer;
