"use client";

import { Popover, PopoverDisclosure, PopoverProvider } from "@ariakit/react";

export function TallPopover() {
  return (
    <PopoverProvider>
      <PopoverDisclosure className="justify-self-start">
        Open popover
      </PopoverDisclosure>
      <Popover
        portal
        gutter={8}
        aria-label="Tall popover"
        className="h-[30rem] w-64 overflow-auto rounded-lg border border-black/20 bg-white p-4 shadow-lg"
      >
        Popover content
      </Popover>
    </PopoverProvider>
  );
}
