import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  SkeletonCircle,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { TooltipText } from "@ariakit/ui/components/tooltip.ariakit.react";
import { tooltip } from "@ariakit/ui/styles/tooltip";

const TITLE = "Pricing experiments for the team plan";

export default function Thumbnail() {
  return (
    <Frame
      $lighten
      $rounded="xl"
      $border
      $p={4}
      className="mt-10 grid w-[13em] max-w-full grid-cols-1 gap-3 shadow-sm"
    >
      {/* The pointer rests on the cut-off title, so its tooltip shows above
          it with the full text. */}
      <span className="relative min-w-0">
        <span className="block truncate font-medium underline decoration-1 underline-offset-[0.25em]">
          {TITLE}
        </span>
        {/* Static markup needs data-open to show the tooltip, and the
            thumbnail must not play the open animation on page load. */}
        <span
          data-open
          {...tooltip.jsx({
            // The tooltip of a TruncatedText keeps the popover surface.
            $invert: false,
            className:
              "absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap transition-none",
          })}
        >
          <TooltipText>{TITLE}</TooltipText>
        </span>
      </span>
      <SkeletonLine $weight="medium" className="w-2/3" />
      <SkeletonLine $weight="medium" className="w-5/6" />
      <SkeletonLine $weight="medium" className="w-1/2" />
    </Frame>
  );
}

// A line that ends in three dots stands for text that is cut off.
export function SmallThumbnail() {
  return (
    <Frame $lighten $p={3} className="flex items-center gap-2.5">
      <SkeletonLine $weight="medium" className="flex-1 text-[1.25em]" />
      <span className="flex shrink-0 gap-1.5">
        <SkeletonCircle $weight="bold" className="size-3.5" />
        <SkeletonCircle $weight="bold" className="size-3.5" />
        <SkeletonCircle $weight="bold" className="size-3.5" />
      </span>
    </Frame>
  );
}
