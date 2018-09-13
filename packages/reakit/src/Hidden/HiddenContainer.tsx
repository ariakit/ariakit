import * as React from "react";
import * as PropTypes from "prop-types";
import { Container, ComposableContainer, ActionMap } from "constate";

interface State {
  visible: boolean;
}

interface Actions {
  show: () => void;
  hide: () => void;
  toggle: () => void;
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

const HiddenContainer: ComposableContainer<State, Actions> = props => (
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
