import * as React from "react";
import callAll from "../_utils/callAll";
import uniqueId from "../_utils/uniqueId";
import HiddenContainer, { HiddenContainerProps } from "../Hidden/HiddenContainer";

const onMount = ({ setState }: { setState: any }) => {
  setState({ popoverId: uniqueId("popover") });
};

const PopoverContainer = (props: HiddenContainerProps) => (
  <HiddenContainer {...props} onMount={callAll(onMount, props.onMount)} />
);

export default PopoverContainer;
