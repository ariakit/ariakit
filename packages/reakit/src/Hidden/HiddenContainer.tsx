import * as React from "react";
import * as PropTypes from "prop-types";
import { Container, ComposableContainer, ActionMap } from "constate";

export interface HiddenContainerState {
  visible: boolean;
}

export interface HiddenContainerActions {
  show: () => void;
  hide: () => void;
  toggle: () => void;
}

export const initialState: HiddenContainerState = { visible: false };

export const show = () => () => ({ visible: true });
export const hide = () => () => ({ visible: false });
export const toggle = () => (state: HiddenContainerState) => ({
  visible: !state.visible
});

export const actions: ActionMap<
  HiddenContainerState,
  HiddenContainerActions
> = {
  show,
  hide,
  toggle
};

const HiddenContainer: ComposableContainer<
  HiddenContainerState,
  HiddenContainerActions
> = props => (
  <Container
    {...props}
    initialState={{ ...initialState, ...props.initialState }}
    actions={actions}
  />
);

// @ts-ignore
HiddenContainer.propTypes = {
  initialState: PropTypes.object,
  actions: PropTypes.objectOf(PropTypes.func)
};

export default HiddenContainer;
