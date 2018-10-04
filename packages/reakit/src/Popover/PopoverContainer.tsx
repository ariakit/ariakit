import * as React from "react";
import { ComposableContainer } from "constate/dist/ts/src";
import callAll from "../_utils/callAll";
import uniqueId from "../_utils/uniqueId";
import HiddenContainer, {
  HiddenContainerState,
  HiddenContainerActions
} from "../Hidden/HiddenContainer";

const onMount = ({ setState }: { setState: any }) => {
  setState({ popoverId: uniqueId("popover") });
};

const PopoverContainer: ComposableContainer<
  HiddenContainerState,
  HiddenContainerActions
> = props => (
  <HiddenContainer {...props} onMount={callAll(onMount, props.onMount)} />
);

export default PopoverContainer;
