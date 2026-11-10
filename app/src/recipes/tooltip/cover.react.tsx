import type { FrameProps } from "@ariakit/ui/components/frame.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Kbd } from "@ariakit/ui/components/kbd.ariakit.react";
import {
  TooltipSlot,
  TooltipText,
} from "@ariakit/ui/components/tooltip.ariakit.react";
import { button, buttonGroup, buttonSlot } from "@ariakit/ui/styles/button";
import { tooltip } from "@ariakit/ui/styles/tooltip";
import { cx } from "clava";
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

// Static markup needs data-open to show the tooltip, and the cover must not
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

export default function Cover() {
  return (
    // The card is too short for two rows, so narrow cards show only the toolbar.
    <div className="@container/tooltip w-[19em] max-w-full">
      <div className="flex items-center justify-center gap-4 pt-10">
        <Frame $lighten $rounded="xl" $border $p={1} className="shadow-sm">
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
                    <TooltipText>Italic</TooltipText>
                    <TooltipSlot $kind="text">
                      <Kbd>⌘I</Kbd>
                    </TooltipSlot>
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
              className={cx(
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
