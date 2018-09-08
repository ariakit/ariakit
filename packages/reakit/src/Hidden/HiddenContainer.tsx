import * as React from "react";
import * as PropTypes from "prop-types";
import { Container, ContainerProps, ActionMap, StateUpdater } from "constate";

interface State {
  visible: boolean;
}

interface Actions {
  show: StateUpdater<State>;
  hide: StateUpdater<State>;
  toggle: StateUpdater<State>;
}

export const initialState: State = { visible: false };

export const show = () => () => ({ visible: true });
export const hide = () => () => ({ visible: false });
export const toggle = () => (state: State) => ({ visible: !state.visible });

const actions: ActionMap<State, Actions> = {
  show,
  hide,
  toggle
};

const HiddenContainer = (props: ContainerProps<State, Actions>) => (
  <Container
    {...props}
    initialState={{ ...initialState, ...props.initialState }}
    actions={{ ...actions, ...props.actions }}
  />
);

// @ts-ignore
HiddenContainer.propTypes = {
  initialState: PropTypes.object,
  actions: PropTypes.objectOf(PropTypes.func)
};

export default HiddenContainer;
