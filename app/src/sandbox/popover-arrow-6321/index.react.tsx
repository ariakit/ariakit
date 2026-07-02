import * as Ariakit from "@ariakit/react";

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
}

function RingPopover({ label, boxShadow }: RingPopoverProps) {
  return (
    <Ariakit.PopoverProvider>
      <Ariakit.PopoverDisclosure>{label}</Ariakit.PopoverDisclosure>
      <Ariakit.Popover style={{ background: "white", padding: 16, boxShadow }}>
        <Ariakit.PopoverArrow className="arrow" />
        <Ariakit.PopoverHeading>{label}</Ariakit.PopoverHeading>
        <p>Popover outlined by a box-shadow ring.</p>
      </Ariakit.Popover>
    </Ariakit.PopoverProvider>
  );
}

export default function Example() {
  return (
    <div style={{ display: "flex", gap: 16, padding: 64 }}>
      <RingPopover label="Thin ring" boxShadow={`0 0 0 1px ${ringColor}`} />
      <RingPopover label="Thick ring" boxShadow={`0 0 0 10px ${ringColor}`} />
      <RingPopover
        label="Fractional ring"
        boxShadow={`0 0 0 0.5px ${ringColor}`}
      />
      {/* Tailwind v3 ring utilities emit zero-spread placeholder shadows
          around the actual ring, plus a regular drop shadow after it. The
          placeholders must be skipped, and the ring color must not be confused
          by the commas inside color functions. */}
      <RingPopover
        label="Tailwind ring"
        boxShadow={`0 0 0 0px rgba(255, 255, 255, 0), 0 0 0 3px ${ringColor}, 0 1px 2px 0 rgba(0, 0, 0, 0.3)`}
      />
    </div>
  );
}
