import { SkeletonLine } from "@ariakit/ui/components/skeleton.ariakit.react";
import {
  tab,
  tabLabel,
  tabList,
  tabPanels,
  tabSeparator,
  tabs,
} from "@ariakit/ui/styles/tabs";

export default function Thumbnail() {
  return (
    <div {...tabs.jsx({ className: "w-[19em] max-w-full" })}>
      <div {...tabList.jsx()}>
        <div {...tab.jsx()} aria-selected="true">
          <span {...tabLabel.jsx()} data-text="Overview">
            Overview
          </span>
          {/* Card thumbnails scale the scene with a transform, which can leave
              the folder's bottom edge on a fractional pixel exactly over the
              panel border, so that border shows through as a faint line. A
              strip of the tab surface spans the border with a pixel to spare
              on each side, covering the seam between the folder sides without
              moving its bottom curves. */}
          <span className="absolute inset-x-0 -bottom-px h-[3px] bg-(--ak-layer)" />
        </div>
        <div {...tabSeparator.jsx()} aria-hidden />
        <div {...tab.jsx()} aria-selected="false">
          <span {...tabLabel.jsx()} data-text="Activity">
            Activity
          </span>
        </div>
        <div {...tabSeparator.jsx()} aria-hidden />
        <div {...tab.jsx()} aria-selected="false">
          <span {...tabLabel.jsx()} data-text="Files">
            Files
          </span>
        </div>
      </div>
      <div {...tabPanels.jsx({ className: "grid gap-2.5" })}>
        <SkeletonLine className="w-4/5" />
        <SkeletonLine $weight="light" className="w-full" />
        <SkeletonLine $weight="light" className="w-full" />
        <SkeletonLine $weight="light" className="w-3/5" />
        <SkeletonLine $weight="light" className="w-4/5" />
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
        // height.
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
      <div {...tabPanels.jsx({ className: "grid flex-1 content-start gap-2" })}>
        <SkeletonLine className="w-4/5" />
        <SkeletonLine $weight="light" className="w-full" />
        <SkeletonLine $weight="light" className="w-1/2" />
      </div>
    </div>
  );
}
