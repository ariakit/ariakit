import { SkeletonLine } from "@ariakit/ui/components/skeleton.ariakit.react";
import {
  tab,
  tabLabel,
  tabList,
  tabPanels,
  tabSeparator,
  tabs,
} from "@ariakit/ui/styles/tabs";

export default function Cover() {
  return (
    <div {...tabs.jsx({ className: "w-[19em] max-w-full" })}>
      <div {...tabList.jsx()}>
        <div {...tab.jsx()} aria-selected="true">
          <span {...tabLabel.jsx()} data-text="Overview">
            Overview
          </span>
          {/* Covers scale the scene with a transform, which can leave
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
