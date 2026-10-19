import { badge } from "@ariakit/ui/styles/badge";
import { frame } from "@ariakit/ui/styles/frame";
import { tab, tabList, tabPanels, tabs } from "@ariakit/ui/styles/tabs";
import { PlaceholderText } from "#app/components/placeholder-text.react.tsx";

const posts = [
  { title: "Answering “What ARIA can I use?”", meta: "Maya Chen · 48" },
  { title: "Privacy Principles for the Web", meta: "Jonas Weber · 31" },
  { title: "Stepping forward on WAI", meta: "Priya Raman · 19" },
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
            <PlaceholderText>New</PlaceholderText>
          </div>
        </div>
        <div {...tabPanels.jsx({ className: "grid gap-3" })}>
          {posts.map((post) => (
            <div key={post.title} className="flex items-center gap-2">
              <div
                {...frame.jsx({
                  $layer: true,
                  $rounded: "md",
                  $border: true,
                  className: "h-7 w-9 shrink-0",
                })}
              />
              <div className="grid min-w-0 gap-0.5">
                <PlaceholderText size="sm" className="truncate">
                  {post.title}
                </PlaceholderText>
                <PlaceholderText weight="light" size="sm">
                  {post.meta}
                </PlaceholderText>
              </div>
              <div {...badge.jsx({ className: "ms-auto h-5 w-10 shrink-0" })} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
