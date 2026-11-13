import { List, ListItem } from "@ariakit/ui/components/list.ariakit.react";
import type { ReactNode } from "react";

interface CommitProps {
  hash: string;
  message: string;
  /** The list of the commits that this commit merges. */
  children?: ReactNode;
}

function Commit({ hash, message, children }: CommitProps) {
  return (
    // The curves of a branch expect rows of one line, so a long message is
    // cut. A row is a grid item, which does not get narrower than its content
    // unless its minimum width is zero.
    <ListItem className="min-w-0">
      <span className="flex items-baseline gap-3">
        <code className="ak-ink-60 font-mono text-sm">{hash}</code>
        <span className="min-w-0 truncate">{message}</span>
      </span>
      {children}
    </ListItem>
  );
}

export default function Example() {
  return (
    // The guide prop turns the guide on and sets its color. The bullets take
    // the color of their guide. A small gap keeps the rows as close as the
    // lines of a log.
    <List guide={{ $edge: "brand" }} $gap={2} className="w-96 max-w-full">
      <Commit hash="8f2c1ad" message='Merge branch "dark-theme"'>
        {/* A nested list with $branch leaves the guide of its parent before
            its first row and joins that guide again after its last row. */}
        <List $branch guide={{ $edge: "success" }}>
          <Commit hash="c41e9b0" message="Add a theme switch to the header" />
          <Commit hash="5a7d3e2" message="Add the dark color tokens" />
        </List>
      </Commit>
      <Commit hash="1e62b86" message="Update the changelog" />
      <Commit hash="3e1f0a4" message='Merge branch "search"'>
        <List $branch guide={{ $edge: "warning" }}>
          <Commit hash="b72d9c1" message="Show the recent searches" />
          <Commit hash="0b9e4c7" message="Highlight the matched text" />
          <Commit hash="9a4c2e8" message="Add a search field" />
        </List>
      </Commit>
      <Commit hash="c5bd2af" message="Fix the focus ring of the menu" />
      <Commit hash="29c2bfe" message="Create the project" />
    </List>
  );
}
