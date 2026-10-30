import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  SkeletonBox,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { badge, badgeLabel, badgeSlot } from "@ariakit/ui/styles/badge";
import { tab, tabList, tabPanels, tabs } from "@ariakit/ui/styles/tabs";
import { LockIcon } from "lucide-react";

interface PostData {
  id: string;
  score: number;
  title: string;
  // Posts without meta show a placeholder line under the title.
  meta?: string;
  tag: string;
}

const posts: PostData[] = [
  {
    id: "aria",
    score: 312,
    title: "Answering “What ARIA can I use?”",
    meta: "Maya Chen · 5 hours ago · 48 replies",
    tag: "ARIA",
  },
  {
    id: "focus",
    score: 128,
    title: "Focus rings that work on every surface",
    tag: "CSS",
  },
];

export default function Thumbnail() {
  return (
    <div {...tabs.jsx({ className: "w-[52em]" })}>
      <div {...tabList.jsx()}>
        <div {...tab.jsx()} aria-selected="true">
          Hot
          {/* Card thumbnails scale the scene with a transform, which can leave
              the folder's bottom edge on a fractional pixel exactly over the
              panel border, so that border shows through as a faint line. A
              strip of the tab surface spans the border with a pixel to spare
              on each side, covering the seam between the folder sides without
              moving its bottom curves. */}
          <span className="absolute inset-x-0 -bottom-px h-[3px] bg-(--ak-layer)" />
        </div>
        <div {...tab.jsx()} aria-selected="false">
          New
        </div>
        <div {...tab.jsx()} aria-selected="false">
          Top
        </div>
        {/* The address follows the selected tab. */}
        <span {...badge.jsx({ className: "ms-auto me-20 self-center" })}>
          <span {...badgeSlot.jsx()}>
            <LockIcon />
          </span>
          <span {...badgeLabel.jsx()}>
            acme.dev/forum/<b>hot</b>
          </span>
        </span>
      </div>
      <div {...tabPanels.jsx({ className: "grid gap-3" })}>
        {posts.map((post) => (
          <div key={post.id} className="flex items-center gap-2.5">
            <Frame
              $layer
              $rounded="md"
              $border
              className="grid h-8 w-10 shrink-0 place-items-center font-semibold"
            >
              {post.score}
            </Frame>
            <div className="grid min-w-0">
              <span className="flex items-center gap-2">
                <span className="font-medium">{post.title}</span>
                <span {...badge.jsx({ $rounded: "sm" })}>
                  <span {...badgeLabel.jsx()}>{post.tag}</span>
                </span>
              </span>
              {post.meta ? (
                <span className="ak-ink-70">{post.meta}</span>
              ) : (
                <SkeletonLine $weight="light" className="mt-1 w-40" />
              )}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2.5">
          <SkeletonBox $rounded="md" className="h-8 w-10 shrink-0" />
          <div className="grid w-60 gap-1">
            <SkeletonLine className="w-4/5" />
            <SkeletonLine $weight="light" className="w-3/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SmallThumbnail() {
  return (
    // The root covers the slot and shares its border, so the tabs and panel
    // borders meet the slot edge without doubling it.
    <div
      {...tabs.jsx({
        $cover: true,
        $p: 2,
        // The panel clips content that does not fit, so the root keeps the slot
        // height when ring tabs reserve extra room on dark surfaces.
        className: "flex min-h-0 flex-col",
      })}
    >
      <div {...tabList.jsx()}>
        <div {...tab.jsx()} aria-selected="true">
          <SkeletonLine $weight="bold" className="w-12.5" />
        </div>
        <div {...tab.jsx()} aria-selected="false">
          <SkeletonLine $weight="medium" className="w-12.5" />
        </div>
      </div>
      <div
        {...tabPanels.jsx({ className: "flex min-h-0 flex-1 flex-col gap-2" })}
      >
        <div className="flex flex-1 items-start gap-4.5">
          <Frame $lightnessOffset className="h-full w-1/2 shrink-0" />
          <div className="grid flex-1 gap-1">
            <SkeletonLine className="w-full" />
            <SkeletonLine $weight="light" className="w-full" />
            <SkeletonLine $weight="light" className="w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
