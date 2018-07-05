import React from "react";
import { Container } from "reakit";
import "whatwg-fetch";

const initialState = {
  stars: 0
};

const onMount = async ({ setState }) => {
  try {
    const result = await fetch("https://api.github.com/repos/diegohaz/reakit");
    const { stargazers_count: stars } = await result.json();
    setState({ stars });
  } catch (e) {
    setState({ error: e });
  }
};

const GitHubStarsContainer = props => (
  <Container
    {...props}
    initialState={{ ...initialState, ...props.initialState }}
    onMount={onMount}
  />
);

export default GitHubStarsContainer;
