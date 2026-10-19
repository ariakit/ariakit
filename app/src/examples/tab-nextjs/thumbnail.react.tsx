import { SkeletonLine } from "@ariakit/ui/components/skeleton.ariakit.react";
import { badge } from "@ariakit/ui/styles/badge";
import { frame } from "@ariakit/ui/styles/frame";
import { tab, tabList, tabPanels, tabs } from "@ariakit/ui/styles/tabs";

// Placeholder widths for the title and meta lines of each post.
const posts = [
  { id: "aria", title: "w-48", meta: "w-24" },
  { id: "privacy", title: "w-44", meta: "w-28" },
  { id: "wai", title: "w-36", meta: "w-24" },
];

export default function Thumbnail() {
  return (
    <div className="flex flex-col items-center pointer-events-none" aria-hidden>
      <div {...tabs.jsx({ className: "w-72 max-w-full mt-4" })}>
        <div {...tabList.jsx()}>
          <div {...tab.jsx()} aria-selected="true">
            Hot
          </div>
          <div {...tab.jsx()} aria-selected="false">
            <SkeletonLine className="w-8" />
          </div>
        </div>
        <div {...tabPanels.jsx({ className: "grid gap-3" })}>
          {posts.map((post) => (
            <div key={post.id} className="flex items-center gap-2">
              <div
                {...frame.jsx({
                  $layer: true,
                  $rounded: "md",
                  $border: true,
                  className: "h-7 w-9 shrink-0",
                })}
              />
              <div className="grid min-w-0 gap-0.5">
                <SkeletonLine className={`max-w-full text-sm ${post.title}`} />
                <SkeletonLine
                  $weight="light"
                  className={`max-w-full text-sm ${post.meta}`}
                />
              </div>
              <div {...badge.jsx({ className: "ms-auto h-5 w-10 shrink-0" })} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
