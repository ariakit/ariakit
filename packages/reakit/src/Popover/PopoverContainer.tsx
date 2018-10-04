import * as React from "react";
import { ComposableContainer, OnMount } from "constate";
import callAll from "../_utils/callAll";
import uniqueId from "../_utils/uniqueId";
import HiddenContainer, {
  HiddenContainerState,
  HiddenContainerActions
} from "../Hidden/HiddenContainer";

export interface PopoverContainerState extends HiddenContainerState {
  popoverId?: string;
}

const onMount: OnMount<PopoverContainerState> = ({ setState }) => {
  setState({ popoverId: uniqueId("popover") });
};

const PopoverContainer: ComposableContainer<
  PopoverContainerState,
  HiddenContainerActions
> = props => (
  <HiddenContainer {...props} onMount={callAll(onMount, props.onMount)} />
);

export default PopoverContainer;
