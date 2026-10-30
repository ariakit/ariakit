import type { FrameProps } from "@ariakit/ui/components/frame.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Kbd } from "@ariakit/ui/components/kbd.ariakit.react";
import {
  SkeletonBox,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { TooltipSlot } from "@ariakit/ui/components/tooltip.ariakit.react";
import { button, buttonGroup, buttonSlot } from "@ariakit/ui/styles/button";
import { tooltip } from "@ariakit/ui/styles/tooltip";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import { BoldIcon, CodeIcon, ItalicIcon, UnderlineIcon } from "lucide-react";

interface Tool {
  id: string;
  icon: LucideIcon;
  hovered?: boolean;
}

// The pointer rests on Italic, so its tooltip shows above it.
const tools: Tool[] = [
  { id: "bold", icon: BoldIcon },
  { id: "italic", icon: ItalicIcon, hovered: true },
  { id: "underline", icon: UnderlineIcon },
  { id: "code", icon: CodeIcon },
];

// Static markup needs data-open to show the tooltip, and the thumbnail must not
// play the open animation on page load.
const tooltipProps = tooltip.jsx({
  className:
    "transition-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap",
});

// A square frame that keeps straight corners inside the rounded window.
function Region(props: FrameProps) {
  return <Frame $rounded="none" $forceRounded $p="none" {...props} />;
}

export default function Thumbnail() {
  return (
    <Frame
      $layer
      $lighten
      $rounded="xl"
      $border
      $p="none"
      className="mt-12 grid w-80 text-sm shadow-lg"
    >
      <Region $p={1.5} className="border-b">
        <div {...buttonGroup.jsx()}>
          {tools.map((tool) => (
            <span
              key={tool.id}
              // A surface stands for the hover state of the button.
              {...button.jsx({
                $layer: tool.hovered ? true : undefined,
                className: "relative",
              })}
            >
              <span {...buttonSlot.jsx()}>
                <tool.icon />
              </span>
              {tool.hovered && (
                <span {...tooltipProps} data-open>
                  Italic
                  <TooltipSlot $kind="text">
                    <Kbd>⌘I</Kbd>
                  </TooltipSlot>
                </span>
              )}
            </span>
          ))}
        </div>
      </Region>
      <Region $p={4} className="grid gap-2">
        <SkeletonLine $weight="bold" className="w-1/2 text-base" />
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-3/5" />
      </Region>
    </Frame>
  );
}

export function SmallThumbnail() {
  return (
    <Frame
      $layer
      $lighten
      $p="none"
      className="flex flex-col items-center justify-center gap-4"
    >
      {/* A coarse inverted pill stands for the tooltip, since the slot is too
          small for its text. The arrow takes the pill color and points to the
          hovered button. */}
      <Frame
        $layer
        $invert
        $rounded="sm"
        $forceRounded
        $p={2.5}
        className={clsx(
          "relative flex w-3/5 justify-center",
          "after:absolute after:top-full after:left-1/2 after:-translate-x-1/2",
          "after:border-x-[1em] after:border-t-[1em] after:border-x-transparent after:border-t-(--ak-layer)",
        )}
      >
        <SkeletonLine
          $weight="bold"
          className="w-3/5 text-[1.25em] leading-none"
        />
      </Frame>
      <div className="flex gap-2.5">
        <SkeletonBox
          $weight="light"
          $rounded="sm"
          $forceRounded
          className="size-10"
        />
        <SkeletonBox
          $weight="bold"
          $rounded="sm"
          $forceRounded
          className="size-10"
        />
        <SkeletonBox
          $weight="light"
          $rounded="sm"
          $forceRounded
          className="size-10"
        />
      </div>
    </Frame>
  );
}
