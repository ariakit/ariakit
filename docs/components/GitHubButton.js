import React from "react";
import GoMarkGithub from "react-icons/lib/go/mark-github";
import as, { styled, Button } from "../../src";

const Wrapper = styled(Button)`
  background-color: white;
  color: #333 !important;
  &&&:hover {
    text-decoration: none !important;
  }
`;

const GitHubButton = props => (
  <Wrapper {...props} href="https://github.com/diegohaz/reas">
    <GoMarkGithub />
    View on GitHub
  </Wrapper>
);

export default as("a")(GitHubButton);
