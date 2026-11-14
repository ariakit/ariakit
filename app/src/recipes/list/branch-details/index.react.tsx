import { Avatar } from "@ariakit/ui/components/avatar.ariakit.react";
import { Badge } from "@ariakit/ui/components/badge.ariakit.react";
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
        {/* The name follows the avatar, so the avatar stays decorative. */}
        <Avatar $layer="brand" $hue={author.hue} $size={6}>
          {getInitials(author.name)}
        </Avatar>
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
