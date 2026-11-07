import { Badge, BadgeLabel } from "@ariakit/ui/components/badge.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Nav,
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
import { ExampleRouter, RouterNavLink } from "../router.react.tsx";

const tabs = [
  { label: "Code", path: "/code", icon: CodeXml },
  { label: "Issues", path: "/issues", icon: CircleDot, count: 128 },
  {
    label: "Pull requests",
    path: "/pull-requests",
    icon: GitPullRequest,
    count: 14,
  },
  { label: "Actions", path: "/actions", icon: Play },
  { label: "Settings", path: "/settings", icon: Settings },
];

function Repository() {
  return (
    <Frame
      $lighten={0.5}
      $rounded="2xl"
      $border
      $p="none"
      $orientation="vertical"
      className="grid w-3xl max-w-full overflow-clip"
    >
      {/* The header covers the top of the card, so the tabs stay concentric
          with its corners. */}
      <Frame $cover $p={2} className="grid border-b">
        <span className="flex items-center gap-2 px-2 pt-1">
          <BookMarked className="ak-ink-70 size-4" aria-hidden />
          <span>acme</span>
          <span className="ak-ink-60">/</span>
          <span className="font-semibold">web-app</span>
          <Badge $darken={0.5}>
            <BadgeLabel>Public</BadgeLabel>
          </Badge>
        </span>
        {/* The tabs cover the sides and the bottom of the header and take its
            padding, so they scroll from edge to edge. The bar marks the
            current tab on the edge of the header, on the line below it, so
            the current tab needs no surface of its own. The scroll buttons
            stay round instead of following the corners of the card. */}
        <Nav
          aria-label="Repository"
          $layout="horizontal"
          $cover
          bar
          previousButton={{ $forceRounded: true }}
          nextButton={{ $forceRounded: true }}
        >
          {tabs.map((tab) => (
            <RouterNavLink key={tab.label} to={tab.path} $selectedPush={false}>
              <NavSlot>
                <tab.icon />
              </NavSlot>
              {/* The text reserves the width of the heavier current label, so
                  the tabs keep their widths when the current tab changes. */}
              <NavLinkLabel text={tab.label} />
              {tab.count && (
                <NavSlot $kind="box">
                  <Badge $kind="solid" $layer $darken={1}>
                    {tab.count}
                  </Badge>
                </NavSlot>
              )}
            </RouterNavLink>
          ))}
        </Nav>
      </Frame>
      <Frame
        render={<ul />}
        aria-hidden
        $cover
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

export default function Example() {
  return (
    <ExampleRouter initialPath="/code">
      <Repository />
    </ExampleRouter>
  );
}
