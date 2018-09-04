import * as React from "react";
import { Container, ActionMap, ComposableContainer } from "reakit";

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

const ThemeContainer: ComposableContainer<State, Actions> = props => (
  <Container
    context="theme"
    {...props}
    initialState={{ ...initialState, ...props.initialState }}
    actions={actions}
  />
);

export default ThemeContainer;
