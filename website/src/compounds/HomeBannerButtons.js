import React from "react";
import { Link } from "react-router-dom";
import LibraryBooksIcon from "react-icons/lib/md/library-books";
import CodeIcon from "react-icons/lib/fa/code";
import GitHubIcon from "react-icons/lib/go/mark-github";
import { styled, Grid } from "reas";
import PrimaryButton from "../elements/PrimaryButton";
import SecondaryButton from "../elements/SecondaryButton";

const Wrapper = styled(Grid)`
  grid-auto-flow: column;
  grid-auto-columns: min-content;
  grid-gap: 8px;
  @media (max-width: 768px) {
    grid-auto-flow: row;
  }
`;

const HomeButtons = props => (
  <Wrapper {...props}>
    <PrimaryButton as={Link} to="/guide">
      <LibraryBooksIcon />Get Started
    </PrimaryButton>
    <SecondaryButton as={Link} to="/components">
      <CodeIcon />Components
    </SecondaryButton>
    <SecondaryButton
      as="a"
      href="https://github.com/diegohaz/reas"
      target="_blank"
    >
      <GitHubIcon />GitHub
    </SecondaryButton>
  </Wrapper>
);

export default HomeButtons;
