import * as Ariakit from "@ariakit/react";
import type { CSSProperties } from "react";
import { useState } from "react";

// See https://github.com/ariakit/ariakit/issues/6321
//
// PopoverArrow infers its stroke from the popover's computed styles, treating
// a box-shadow with zero offsets/blur and a positive spread (a Tailwind-style
// "ring") as the border. Both halves of that inference are broken:
// - The ring-width regex rejects any spread whose px text contains the digit
//   0, so 10px and 0.5px rings are not detected and the arrow renders with no
//   stroke at all.
// - The ring color is never used, so even detected rings (1px) draw the arrow
//   with the popover's inherited text color instead of the ring color.
const ringColor = "rgb(59, 130, 246)";

interface RingPopoverProps {
  label: string;
  boxShadow: string;
  style?: CSSProperties;
}

function RingPopover({ label, boxShadow, style }: RingPopoverProps) {
  return (
    <Ariakit.PopoverProvider>
      <Ariakit.PopoverDisclosure>{label}</Ariakit.PopoverDisclosure>
      <Ariakit.Popover
        style={{ background: "white", padding: 16, boxShadow, ...style }}
      >
        <Ariakit.PopoverArrow className="arrow" />
        <Ariakit.PopoverHeading>{label}</Ariakit.PopoverHeading>
        <p>Popover outlined by a box-shadow ring.</p>
      </Ariakit.Popover>
    </Ariakit.PopoverProvider>
  );
}

// See https://github.com/ariakit/ariakit/issues/6320
function RtlPlacementPopover() {
  const [placement, setPlacement] = useState<"right" | "top">("right");
  return (
    <div dir="rtl">
      <div
        className="scroller"
        style={{
          width: 600,
          height: 400,
          overflow: "auto",
          border: "1px solid gray",
        }}
      >
        <div style={{ position: "relative", width: 1600, height: 380 }}>
          <Ariakit.PopoverProvider placement={placement}>
            <Ariakit.PopoverDisclosure
              style={{ position: "absolute", top: 280, right: 450 }}
            >
              Accept invite
            </Ariakit.PopoverDisclosure>
            <Ariakit.Popover
              flip="top bottom"
              style={{
                width: 200,
                padding: 8,
                background: "white",
                color: "black",
                border: "1px solid gray",
              }}
            >
              <Ariakit.PopoverArrow className="arrow" />
              <Ariakit.PopoverHeading>Team meeting</Ariakit.PopoverHeading>
              <p>We are going to discuss the project.</p>
              <button type="button" onClick={() => setPlacement("top")}>
                Show above
              </button>
            </Ariakit.Popover>
          </Ariakit.PopoverProvider>
        </div>
      </div>
    </div>
  );
}

export default function Example() {
  return (
    <>
      <RtlPlacementPopover />
      <div style={{ display: "flex", gap: 16, padding: 64 }}>
        <RingPopover label="Thin ring" boxShadow={`0 0 0 1px ${ringColor}`} />
        <RingPopover label="Thick ring" boxShadow={`0 0 0 10px ${ringColor}`} />
        <RingPopover
          label="Fractional ring"
          boxShadow={`0 0 0 0.5px ${ringColor}`}
        />
        {/* Tailwind v3 ring utilities emit zero-spread placeholder shadows
            around the actual ring, plus a regular drop shadow after it. The
            placeholders must be skipped, and the ring color must not be
            confused by the commas inside color functions. */}
        <RingPopover
          label="Tailwind ring"
          boxShadow={`0 0 0 0px rgba(255, 255, 255, 0), 0 0 0 3px ${ringColor}, 0 1px 2px 0 rgba(0, 0, 0, 0.3)`}
        />
        {/* Inset rings hug the popover edge like a border, so the arrow must
            draw them too, and the inset keyword must not leak into the
            inferred ring color. */}
        <RingPopover
          label="Inset ring"
          boxShadow={`inset 0 0 0 2px ${ringColor}`}
        />
        {/* A ring with an omitted color defaults to currentColor, so the arrow
            stroke must follow the popover's text color, not its border color,
            which is set to a different color here to tell the two apart. */}
        <RingPopover
          label="Current color ring"
          boxShadow="0 0 0 2px"
          style={{
            color: "rgb(220, 38, 38)",
            borderColor: "rgb(22, 163, 74)",
          }}
        />
      </div>
    </>
  );
}
