import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  SkeletonBox,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { badge } from "@ariakit/ui/styles/badge";
import { tab, tabList, tabPanels, tabs } from "@ariakit/ui/styles/tabs";

// Placeholder widths for the posts after the first one, as fractions of the
// post text column.
const posts = [
  { id: "privacy", title: "w-4/5", meta: "w-3/5" },
  { id: "wai", title: "w-3/4", meta: "w-1/2" },
  { id: "focus", title: "w-2/3", meta: "w-2/5" },
  { id: "landmarks", title: "w-4/5", meta: "w-1/2" },
  { id: "contrast", title: "w-3/5", meta: "w-1/3" },
];

export default function Thumbnail() {
  return (
    <div {...tabs.jsx({ className: "mt-4 w-80 text-sm" })}>
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
      </div>
      <div {...tabPanels.jsx({ className: "grid gap-3" })}>
        <div className="flex items-center gap-2.5">
          <Frame
            $layer
            $rounded="md"
            $border
            className="grid h-8 w-10 shrink-0 place-items-center font-semibold"
          >
            312
          </Frame>
          <div className="grid min-w-0 flex-1">
            <span className="truncate font-medium">
              Answering “What ARIA can I use?”
            </span>
            <span className="ak-ink-70 truncate text-xs">
              Maya Chen · 5 hours ago
            </span>
          </div>
          <span {...badge.jsx({ $rounded: "sm", className: "shrink-0" })}>
            ARIA
          </span>
        </div>
        {posts.map((post) => (
          <div key={post.id} className="flex items-center gap-2.5">
            <SkeletonBox $rounded="md" className="h-8 w-10 shrink-0" />
            <div className="grid flex-1">
              <SkeletonLine className={post.title} />
              <SkeletonLine
                $weight="light"
                className={`text-xs ${post.meta}`}
              />
            </div>
            <SkeletonBox $rounded="sm" className="h-5 w-12 shrink-0" />
          </div>
        ))}
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
        $p: 1.5,
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
          <SkeletonLine $weight="light" className="w-12.5" />
        </div>
      </div>
      <div
        {...tabPanels.jsx({
          $p: 3.5,
          className: "flex min-h-0 flex-1 flex-col gap-2",
        })}
      >
        {posts.slice(0, 2).map((post) => (
          <div key={post.id} className="flex items-center gap-4.5">
            <Frame
              $layer
              $rounded="sm"
              $forceRounded
              $border
              // A real border keeps the box size in both modes, while the
              // automatic type draws a ring outside it on light surfaces.
              $borderType="border"
              $edgeWeight={15}
              className="h-10.5 w-13.5 shrink-0"
            />
            <div className="grid flex-1 gap-1">
              <SkeletonLine className="w-full text-[1.25em] leading-none" />
              <SkeletonLine
                $weight="light"
                className="w-1/2 text-[1.25em] leading-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
