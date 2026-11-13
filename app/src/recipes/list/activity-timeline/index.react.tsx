import { Badge } from "@ariakit/ui/components/badge.ariakit.react";
import { Font } from "@ariakit/ui/components/font.ariakit.react";
import { Kbd } from "@ariakit/ui/components/kbd.ariakit.react";
import { Link } from "@ariakit/ui/components/link.ariakit.react";
import {
  List,
  ListDisclosure,
  ListDisclosureButton,
  ListItem,
} from "@ariakit/ui/components/list.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
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
      $itemPadding={2}
      $itemGap={1}
      className="w-[28rem] max-w-full"
    >
      <ListItem icon={<GitCommitHorizontalIcon />}>
        <p>
          <span className="font-medium">marisol</span> pushed 2 commits
        </p>
        <Font $size={0.875} render={<p />} className="ak-ink-60">
          5 days ago
        </Font>
      </ListItem>
      <ListItem icon={<EyeIcon />}>
        <p>
          <span className="font-medium">marisol</span> requested a review from{" "}
          <span className="font-medium">tobias</span>
        </p>
        <Font $size={0.875} render={<p />} className="ak-ink-60">
          4 days ago
        </Font>
      </ListItem>
      <ListItem icon={<TagIcon />}>
        <p>
          <span className="font-medium">marisol</span> added the label{" "}
          <Badge>feature</Badge>
        </p>
        <Font $size={0.875} render={<p />} className="ak-ink-60">
          4 days ago
        </Font>
      </ListItem>
      {/* A row with a surface is a card that sits above the guide. All rows
          have the same padding, so its marker stays on the guide. */}
      <li>
        <ListDisclosure
          $layer
          $lighten
          $border
          button={
            <ListDisclosureButton
              icon={<MessageSquareIcon />}
              description="2 days ago"
            >
              <span className="font-medium">tobias</span> commented
            </ListDisclosureButton>
          }
        >
          <Prose>
            <p>
              The contrast slider jumps when the value passes 50. It happens
              with the mouse and when I hold <Kbd $kind="keycap">→</Kbd>, so the
              step size is <strong>not the cause</strong>.
            </p>
            <p>
              I recorded it in the{" "}
              <Link href="#preview">preview of this branch</Link>. Can you take
              a look before we merge?
            </p>
          </Prose>
        </ListDisclosure>
      </li>
      <ListItem checked marker={{ $kind: "tint", $layer: "success" }}>
        <p>
          <span className="font-medium">tobias</span> approved these changes
        </p>
        <Font $size={0.875} render={<p />} className="ak-ink-60">
          Today
        </Font>
      </ListItem>
    </List>
  );
}
