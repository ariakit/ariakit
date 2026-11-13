import { Badge } from "@ariakit/ui/components/badge.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { List, ListItem } from "@ariakit/ui/components/list.ariakit.react";
import type { ReactNode } from "react";

interface Person {
  name: string;
  hue: "orange" | "green" | "magenta";
}

const hana: Person = { name: "Hana Kobayashi", hue: "magenta" };
const rosa: Person = { name: "Rosa Delgado", hue: "green" };
const owen: Person = { name: "Owen Walsh", hue: "orange" };

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

interface CommitProps {
  hash: string;
  message: string;
  author: Person;
  /** What the author did and when, such as "authored 2 hours ago". */
  action: string;
  /** The list of the commits that this commit merges. */
  children?: ReactNode;
}

function Commit({ hash, message, author, action, children }: CommitProps) {
  return (
    // The paragraphs switch the lists to blocks mode, so the rows get more
    // space. The bullet stays on the first line of its row.
    <ListItem>
      <div className="flex items-start justify-between gap-4">
        <p className="font-medium">{message}</p>
        <Badge className="font-mono">{hash}</Badge>
      </div>
      <p className="ak-ink-60 flex items-center gap-2 text-sm">
        {/* The name follows the avatar, so the initials are decoration. */}
        <Frame
          render={<span />}
          aria-hidden
          $layer="brand"
          $hue={author.hue}
          // A frame in a list row takes a radius that fits the corners of the
          // row. The avatar keeps its own shape.
          $rounded="full"
          $forceRounded
          $p="none"
          className="grid size-6 flex-none place-items-center font-semibold"
        >
          {/* The spacing scale follows the font size, so the small text goes
              on a child and the avatar keeps its size. */}
          <span className="text-[0.625rem]">{getInitials(author.name)}</span>
        </Frame>
        <span>
          <span className="ak-ink-80 font-medium">{author.name}</span> {action}
        </span>
      </p>
      {children}
    </ListItem>
  );
}

export default function Example() {
  return (
    <List guide={{ $edge: "brand" }} className="w-[26rem] max-w-full">
      <Commit
        hash="8f2c1ad"
        message='Merge branch "dark-theme"'
        author={hana}
        action="merged 2 hours ago"
      >
        {/* A nested list with $branch leaves the guide of its parent after
            the text of its row and joins that guide again before the next
            row. */}
        <List $branch guide={{ $edge: "success" }}>
          <Commit
            hash="c41e9b0"
            message="Add a theme switch"
            author={rosa}
            action="authored 8 hours ago"
          />
          <Commit
            hash="5a7d3e2"
            message="Add the dark color tokens"
            author={owen}
            action="authored yesterday"
          />
        </List>
      </Commit>
      <Commit
        hash="29c2bfe"
        message="Create the project"
        author={hana}
        action="authored last week"
      />
    </List>
  );
}
