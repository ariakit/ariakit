import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { SkeletonLine } from "@ariakit/ui/components/skeleton.ariakit.react";
import { TooltipText } from "@ariakit/ui/components/tooltip.ariakit.react";
import { button, buttonSlot } from "@ariakit/ui/styles/button";
import { tooltip } from "@ariakit/ui/styles/tooltip";
import { CheckIcon } from "lucide-react";

export default function Cover() {
  return (
    <Frame
      $lighten
      $rounded="xl"
      $border
      $p={1}
      className="mt-10 flex w-[17em] max-w-full items-center gap-2 shadow-sm"
    >
      <SkeletonLine $weight="medium" className="ms-2 flex-1" />
      {/* A surface stands for the hover state of the button. */}
      <span {...button.jsx({ $layer: true, className: "relative" })}>
        <span {...buttonSlot.jsx()}>
          <CheckIcon />
        </span>
        {/* Static markup needs data-open to show the tooltip, and the cover must
            not play the open animation on page load. */}
        <span
          data-open
          {...tooltip.jsx({
            className:
              "absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap transition-none",
          })}
        >
          <TooltipText>Copied</TooltipText>
        </span>
      </span>
    </Frame>
  );
}
