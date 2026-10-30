import type { FrameProps } from "@ariakit/ui/components/frame.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  SkeletonBox,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { button, buttonGroup, buttonSlot } from "@ariakit/ui/styles/button";
import { tooltip, tooltipShortcut } from "@ariakit/ui/styles/tooltip";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";
import type { ReactNode } from "react";

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
];

interface Person {
  id: string;
  name: string;
  initials: string;
  hue: FrameProps["$hue"];
  hovered?: boolean;
}

// The pointer rests on the second avatar, so its tooltip shows above it.
const people: Person[] = [
  { id: "maya", name: "Maya Chen", initials: "MC", hue: "orange" },
  { id: "leo", name: "Leo Park", initials: "LP", hue: "blue", hovered: true },
  { id: "ana", name: "Ana Ruiz", initials: "AR", hue: "magenta" },
];

// Static markup needs data-open to show the tooltip, and the thumbnail must not
// play the open animation on page load. Tooltips open above their anchors, so
// the scene keeps room for them at its top.
function Tip({ children }: { children: ReactNode }) {
  return (
    <span
      data-open
      {...tooltip.jsx({
        className:
          "absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap transition-none",
      })}
    >
      {children}
    </span>
  );
}

export default function Thumbnail() {
  return (
    // The card is too short for two rows, so narrow cards show only the toolbar.
    <div className="@container/tooltip w-[19em] max-w-full">
      <div className="flex items-center justify-center gap-4 pt-10">
        <Frame
          $layer
          $lighten
          $rounded="xl"
          $border
          $p={1}
          className="shadow-sm"
        >
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
                  <Tip>
                    Italic
                    <span {...tooltipShortcut.jsx()}>
                      <span>
                        <kbd>⌘</kbd>
                        <kbd>I</kbd>
                      </span>
                    </span>
                  </Tip>
                )}
              </span>
            ))}
          </div>
        </Frame>
        <div className="hidden @[18em]/tooltip:flex">
          {people.map((person) => (
            <Frame
              key={person.id}
              $layer="brand"
              $hue={person.hue}
              $rounded="full"
              $p="none"
              className={clsx(
                "relative grid size-9 place-items-center font-semibold",
                "-ms-1.5 ring-2 ring-(--ak-layer-parent) first:ms-0",
                person.hovered && "z-1 -translate-y-0.5",
              )}
            >
              {person.initials}
              {person.hovered && <Tip>{person.name}</Tip>}
            </Frame>
          ))}
          <Frame
            $layer
            $lightnessOffset
            $rounded="full"
            $p="none"
            className="-ms-1.5 grid size-9 place-items-center font-semibold ring-2 ring-(--ak-layer-parent)"
          >
            +3
          </Frame>
        </div>
      </div>
    </div>
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
