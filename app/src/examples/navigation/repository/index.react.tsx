import { Badge, BadgeLabel } from "@ariakit/ui/components/badge.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Nav,
  NavLink,
  NavLinkLabel,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import {
  SkeletonBox,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import {
  BookMarked,
  CircleDot,
  CodeXml,
  GitPullRequest,
  Play,
  Settings,
} from "lucide-react";
import { useState } from "react";

const tabs = [
  { label: "Code", icon: CodeXml },
  { label: "Issues", icon: CircleDot, count: 128 },
  { label: "Pull requests", icon: GitPullRequest, count: 14 },
  { label: "Actions", icon: Play },
  { label: "Settings", icon: Settings },
];

export default function Example() {
  const [current, setCurrent] = useState("Code");
  return (
    <Frame
      $layer
      $lighten={0.5}
      $rounded="2xl"
      $border
      $p="none"
      $orientation="vertical"
      className="grid w-3xl max-w-full overflow-clip"
    >
      {/* The header covers the top of the card, so the tabs stay concentric
          with its corners. */}
      <Frame $cover $p={2} className="grid gap-2 border-b pb-0!">
        <span className="flex items-center gap-2 px-2 pt-1">
          <BookMarked className="ak-ink-70 size-4" aria-hidden />
          <span>acme</span>
          <span className="ak-ink-60">/</span>
          <span className="font-semibold">web-app</span>
          <Badge $layer $darken={0.5}>
            <BadgeLabel>Public</BadgeLabel>
          </Badge>
        </span>
        {/* The bar marks the current tab on the line below the header, so the
            current tab needs no surface of its own. */}
        <Nav
          aria-label="Repository"
          $layout="horizontal"
          glider={{ $kind: "bar" }}
        >
          {tabs.map((tab) => (
            <NavLink
              key={tab.label}
              href={`#${tab.label.toLowerCase().replace(" ", "-")}`}
              aria-current={current === tab.label ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                setCurrent(tab.label);
              }}
              $selectedPush={false}
              className="mb-1"
            >
              <NavSlot>
                <tab.icon />
              </NavSlot>
              <NavLinkLabel>{tab.label}</NavLinkLabel>
              {tab.count && (
                <NavSlot $kind="badge" $layer $darken={1}>
                  {tab.count}
                </NavSlot>
              )}
            </NavLink>
          ))}
        </Nav>
      </Frame>
      <Frame
        render={<ul />}
        aria-hidden
        $cover
        $layer
        $darken={0.5}
        $p={5}
        className="grid gap-3"
      >
        {["w-1/4", "w-1/3", "w-1/5", "w-2/5", "w-1/4"].map((width, index) => (
          <li key={index} className="flex items-center gap-3">
            <SkeletonBox $rounded="xs" className="size-4 shrink-0" />
            <SkeletonLine $weight="medium" className={width} />
            <SkeletonLine $weight="light" className="ms-auto w-16" />
          </li>
        ))}
      </Frame>
    </Frame>
  );
}
