import { Popover, PopoverDisclosure, PopoverProvider } from "@ariakit/react";
import { useState } from "react";

const popoverClassName =
  "overflow-auto rounded-lg border border-black/20 bg-white p-4 shadow-lg";

export default function Example() {
  const [expanded, setExpanded] = useState(false);
  const [filled, setFilled] = useState(false);
  const [animated, setAnimated] = useState(false);
  return (
    <div
      className={`grid justify-items-start gap-4 ${filled ? "min-h-dvh" : ""}`}
    >
      <button type="button" onClick={() => setExpanded(!expanded)}>
        Toggle details
      </button>
      {expanded && <p className="h-96">Details</p>}
      <button type="button" onClick={() => setAnimated(!animated)}>
        Animate details
      </button>
      <p
        className="overflow-hidden transition-[height] duration-300"
        style={{ height: animated ? 300 : 0 }}
      >
        Animated details
      </p>
      <button type="button" onClick={() => setFilled(!filled)}>
        Fill the viewport
      </button>
      <PopoverProvider>
        <PopoverDisclosure>Open popover</PopoverDisclosure>
        <Popover
          portal
          gutter={8}
          aria-label="Tall popover"
          className={`h-[30rem] w-64 ${popoverClassName}`}
        >
          Popover content
        </Popover>
      </PopoverProvider>
      <PopoverProvider>
        <PopoverDisclosure>Open list</PopoverDisclosure>
        {/* Limits its height to the room below the trigger, as Ariakit UI
            comboboxes do, so it fits a short frame and scrolls its items. */}
        <Popover
          portal
          gutter={8}
          aria-label="List popover"
          className={`max-h-(--popover-available-height) w-64 ${popoverClassName}`}
        >
          <ul className="grid gap-2">
            {Array.from({ length: 30 }, (_, index) => (
              <li key={index}>Item {index + 1}</li>
            ))}
          </ul>
        </Popover>
      </PopoverProvider>
    </div>
  );
}
