import { Badge } from "@ariakit/ui/components/badge.ariakit.react";
import { List, ListItem } from "@ariakit/ui/components/list.ariakit.react";
import {
  EyeIcon,
  GitCommitHorizontalIcon,
  MessageSquareIcon,
  TagIcon,
} from "lucide-react";

export default function Example() {
  return (
    <List
      $marker="icon"
      $markerSize={8}
      $guide
      $itemPadding={3}
      className="w-[28rem] max-w-full"
    >
      <ListItem icon={<GitCommitHorizontalIcon />}>
        <p>
          <span className="font-medium">marisol</span> pushed 2 commits
        </p>
        <p className="ak-ink-60 text-sm">5 days ago</p>
      </ListItem>
      <ListItem icon={<EyeIcon />}>
        <p>
          <span className="font-medium">marisol</span> requested a review from{" "}
          <span className="font-medium">tobias</span>
        </p>
        <p className="ak-ink-60 text-sm">4 days ago</p>
      </ListItem>
      <ListItem icon={<TagIcon />}>
        <p>
          <span className="font-medium">marisol</span> added the label{" "}
          <Badge>feature</Badge>
        </p>
        <p className="ak-ink-60 text-sm">4 days ago</p>
      </ListItem>
      {/* A row with a surface is a card that sits above the guide. All rows
          have the same padding, so its marker stays on the guide. */}
      <ListItem $layer $lighten $border icon={<MessageSquareIcon />}>
        <p>
          <span className="font-medium">tobias</span>{" "}
          <span className="ak-ink-60">commented · 2 days ago</span>
        </p>
        <p>The contrast slider jumps when the value passes 50.</p>
      </ListItem>
      <ListItem checked marker={{ $kind: "tint" }}>
        <p>
          <span className="font-medium">tobias</span> approved these changes
        </p>
        <p className="ak-ink-60 text-sm">Today</p>
      </ListItem>
    </List>
  );
}
