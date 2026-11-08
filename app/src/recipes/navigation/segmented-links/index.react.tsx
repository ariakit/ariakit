import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Nav } from "@ariakit/ui/components/nav.ariakit.react";
import {
  SkeletonBox,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { useLocation } from "react-router";
import { ExampleRouter, RouterNavLink } from "../router.react.tsx";

const feeds = [
  { label: "For you", path: "/for-you", posts: ["w-4/5", "w-3/5", "w-2/3"] },
  { label: "Following", path: "/following", posts: ["w-1/2", "w-4/5"] },
  { label: "Popular", path: "/popular", posts: ["w-2/3", "w-1/2", "w-3/4"] },
];

function Feed() {
  const { pathname } = useLocation();
  const feed = feeds.find((item) => item.path === pathname);
  return (
    <Frame
      $lighten={0.5}
      $rounded="2xl"
      $border
      $p="none"
      $orientation="vertical"
      className="grid w-md max-w-full overflow-clip"
    >
      <Frame $cover $p={3} className="grid justify-items-center border-b">
        {/* The links take the text size of the row, and its scroll buttons
            fit it. */}
        <Nav
          aria-label="Feed"
          $kind="segmented"
          $layout="horizontal"
          $rounded="full"
          $forceRounded
          className="text-sm"
        >
          {feeds.map(({ label, path }) => (
            <RouterNavLink
              key={path}
              to={path}
              $kind="segmented"
              $invert
              text={label}
            />
          ))}
        </Nav>
      </Frame>
      <Frame
        render={<ul />}
        aria-hidden
        $cover
        $darken={0.5}
        $p={4}
        className="grid min-h-60 content-start gap-5"
      >
        {feed?.posts.map((width, index) => (
          <li key={index} className="flex gap-3">
            <SkeletonBox $rounded="full" className="size-9 shrink-0" />
            <div className="grid grow content-start gap-2 pt-1">
              <SkeletonLine $weight="medium" className="w-1/3" />
              <SkeletonLine $weight="light" className={width} />
            </div>
          </li>
        ))}
      </Frame>
    </Frame>
  );
}

export default function Example() {
  return (
    <ExampleRouter initialPath="/for-you">
      <Feed />
    </ExampleRouter>
  );
}
