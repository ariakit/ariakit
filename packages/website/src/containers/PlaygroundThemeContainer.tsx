import * as React from "react";
import { ActionMap, ComposableContainer } from "constate";
import { Container } from "reakit";

interface State {
  themes: string[];
  theme: string;
}

interface Actions {
  setTheme: (theme: string) => void;
}

const initialState: State = {
  themes: ["none", "default"],
  theme: "default"
};

const actions: ActionMap<State, Actions> = {
  setTheme: theme => ({ theme })
};

const PlaygroundThemeContainer: ComposableContainer<State, Actions> = props => (
  <Container
    context="playgroundTheme"
    {...props}
    initialState={{ ...initialState, ...props.initialState }}
    actions={actions}
  />
);

export default PlaygroundThemeContainer;
