import React from "react";
import LibraryBooksIcon from "react-icons/lib/md/library-books";
import CodeIcon from "react-icons/lib/fa/code";
import GitHubIcon from "react-icons/lib/go/mark-github";
import { Grid, Button } from "reas";

const Wrapper = Grid.extend`
  grid-auto-flow: column;
  grid-gap: 20px;
  font-size: 18px;
  font-family: sans-serif;

  @media (max-width: 768px) {
    grid-auto-flow: row;
    grid-gap: 10px;
  }
`;

const HomeButtons = props => (
  <Wrapper {...props}>
    <Button>
      <LibraryBooksIcon />Guide
    </Button>
    <Button>
      <CodeIcon />Components
    </Button>
    <Button>
      <GitHubIcon />GitHub
    </Button>
  </Wrapper>
);

export default HomeButtons;
