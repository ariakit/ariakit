import * as React from "react";
import { EffectMap, ComposableContainer } from "constate";
import { Container } from "reakit";

interface State {
  mode: "light" | "dark";
}

interface Effects {
  toggleMode: () => void;
}

const initialState: State = {
  mode: (localStorage.getItem("reakit.theme.mode") || "light") as State["mode"]
};

const effects: EffectMap<State, Effects> = {
  toggleMode: () => ({ setState }) => {
    setState(state => {
      const mode = state.mode === "dark" ? "light" : "dark";
      localStorage.setItem("reakit.theme.mode", mode);
      return { mode };
    });
  }
};

const ThemeContainer: ComposableContainer<State, {}, {}, Effects> = props => (
  <Container
    context="theme"
    {...props}
    initialState={{ ...initialState, ...props.initialState }}
    effects={effects}
  />
);

export default ThemeContainer;
