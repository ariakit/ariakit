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

const initialState: HiddenContainerState = { visible: false };

const actions: ActionMap<HiddenContainerState, HiddenContainerActions> = {
  show: () => () => ({ visible: true }),
  hide: () => () => ({ visible: false }),
  toggle: () => state => ({
    visible: !state.visible
  })
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
  initialState: PropTypes.object
};

export default Object.assign(HiddenContainer, {
  initialState,
  actions
});
