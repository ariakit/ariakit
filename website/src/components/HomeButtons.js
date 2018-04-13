import React from "react";
import LibraryBooksIcon from "react-icons/lib/md/library-books";
import CodeIcon from "react-icons/lib/fa/code";
import GitHubIcon from "react-icons/lib/go/mark-github";
import { Group, Button } from "../../../src";

const IconButton = Button.extend`
  align-items: start;
`;

const HomeButtons = props => (
  <Group fontFamily="sans-serif" responsive={500} {...props}>
    <IconButton>
      <LibraryBooksIcon />Guide
    </IconButton>
    <IconButton>
      <CodeIcon />Components
    </IconButton>
    <IconButton>
      <GitHubIcon />GitHub
    </IconButton>
  </Group>
);

export default HomeButtons;
