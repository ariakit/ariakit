import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Link } from "@ariakit/ui/components/link.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import { TruncatedText } from "@ariakit/ui/components/truncated-text.ariakit.react";
import { useId } from "react";

const pages = [
  "Launch checklist",
  "Pricing experiments for the self-serve plan",
  "Support rotation",
  "Runbook for the reporting database migration",
];

function getHref(title: string) {
  return `#${title.toLowerCase().replaceAll(/\W+/g, "-")}`;
}

export default function Example() {
  const headingId = useId();
  return (
    // Drag the corner to make the panel narrower or wider.
    <Frame
      render={<section aria-labelledby={headingId} />}
      $layer
      $lighten
      $border
      $rounded="xl"
      $p={4}
      className="grid w-64 max-w-full min-w-40 resize-x grid-cols-1 gap-3 overflow-hidden"
    >
      <h2 id={headingId} className="text-sm font-medium">
        Pinned pages
      </h2>
      <ul className="grid grid-cols-1 gap-2 text-sm">
        {pages.map((title) => (
          <li key={title}>
            {/* The tooltip opens to the right, so it doesn't cover the next
                link in the list. */}
            <Tooltip text={title} placement="right" fitViewport>
              <TruncatedText
                render={
                  <Link href={getHref(title)} className="block truncate" />
                }
              >
                {title}
              </TruncatedText>
            </Tooltip>
          </li>
        ))}
      </ul>
    </Frame>
  );
}
