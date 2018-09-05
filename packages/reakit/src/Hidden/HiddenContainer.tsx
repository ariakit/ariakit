import * as React from "react";
import * as PropTypes from "prop-types";
import { Container, ContainerProps } from "constate";

type ContainerState = {
  visible: boolean;
};

export const initialState: ContainerState = { visible: false };

export const toggle = () => (state: ContainerState) => ({
  visible: !state.visible
});

export const show = () => () => ({ visible: true });

export const hide = () => () => ({ visible: false });

const HiddenContainer = (props: ContainerProps<ContainerState>) => (
  <Container
    {...props}
    initialState={{ ...initialState, ...props.initialState }}
    actions={{ toggle, show, hide, ...props.actions }}
  />
);

// @ts-ignore
HiddenContainer.propTypes = {
  initialState: PropTypes.object,
  actions: PropTypes.objectOf(PropTypes.func)
};

export default HiddenContainer;
