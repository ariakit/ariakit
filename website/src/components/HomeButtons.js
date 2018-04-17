import React from "react";
import LibraryBooksIcon from "react-icons/lib/md/library-books";
import CodeIcon from "react-icons/lib/fa/code";
import GitHubIcon from "react-icons/lib/go/mark-github";
import { Group, Button } from "reas";

const IconButton = Button.extend`
  background-color: #fdfdfd;
`;

const HomeButtons = props => (
  <Group fontSize={18} responsive={768} {...props}>
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
