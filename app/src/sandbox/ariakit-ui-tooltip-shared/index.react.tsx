/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import * as ak from "@ariakit/react";
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import type { TooltipPopoverProps } from "@ariakit/ui/components/tooltip.ariakit.react";
import {
  TooltipAnchor,
  TooltipPopover,
  TooltipProvider,
} from "@ariakit/ui/components/tooltip.ariakit.react";
import { tooltipWrapper } from "@ariakit/ui/styles/tooltip";
import type { VariantProps } from "clava";
import { useEffect, useState } from "react";

const items = ["One", "Two", "Three"];

const scrollItems = Array.from(
  { length: 12 },
  (_, index) => `Item ${index + 1}`,
);

/**
 * Counts the slides of a shared popup, which are transform transitions of the
 * wrapper that Ariakit positions. A slide is motion that no attribute reports,
 * so the count is the visible state that the tests read.
 */
function useSlideCount(section: string) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const onTransitionRun = (event: TransitionEvent) => {
      if (event.propertyName !== "transform") return;
      // The listener is on this document, so its targets are from this window.
      if (!(event.target instanceof HTMLElement)) return;
      const popup = event.target.firstElementChild;
      if (popup?.getAttribute("data-section") !== section) return;
      setCount((count) => count + 1);
    };
    document.addEventListener("transitionrun", onTransitionRun);
    return () => document.removeEventListener("transitionrun", onTransitionRun);
  }, [section]);
  return count;
}

interface SharedTooltipProps
  extends TooltipPopoverProps, VariantProps<typeof tooltipWrapper> {}

/** Shows the `data-tooltip` text of the active anchor in the shared popup. */
function SharedTooltip({ $slide, ...props }: SharedTooltipProps) {
  const store = ak.useTooltipContext();
  const anchor = ak.useStoreState(store, "anchorElement");
  return (
    <TooltipPopover wrapperProps={tooltipWrapper.jsx({ $slide })} {...props}>
      {anchor?.getAttribute("data-tooltip")}
    </TooltipPopover>
  );
}

interface SectionProps extends SharedTooltipProps {
  name: string;
}

function SlideSection({ name, ...props }: SectionProps) {
  const slides = useSlideCount(name);
  return (
    <section aria-label={name} className="grid justify-items-start gap-2">
      <h2 className="text-sm font-medium">{name}</h2>
      <TooltipProvider>
        <div className="flex gap-6">
          {items.map((item) => (
            <TooltipAnchor
              key={item}
              data-tooltip={`${item} tooltip`}
              render={<Button $kind="bevel" />}
            >
              {item}
            </TooltipAnchor>
          ))}
        </div>
        <SharedTooltip data-section={name} {...props} />
      </TooltipProvider>
      <output className="text-sm">Slides: {slides}</output>
    </section>
  );
}

function ScrollSection({ name, ...props }: SectionProps) {
  const slides = useSlideCount(name);
  return (
    <section aria-label={name} className="grid justify-items-start gap-2">
      <h2 className="text-sm font-medium">{name}</h2>
      <TooltipProvider placement="right">
        <div
          role="group"
          aria-label={`${name} list`}
          className="grid h-40 w-32 gap-1 overflow-auto border p-1"
        >
          {scrollItems.map((item) => (
            <TooltipAnchor
              key={item}
              data-tooltip={`${item} tooltip`}
              render={<Button />}
            >
              {item}
            </TooltipAnchor>
          ))}
        </div>
        <SharedTooltip data-section={name} {...props} />
      </TooltipProvider>
      <output className="text-sm">Slides: {slides}</output>
    </section>
  );
}

export default function Example() {
  return (
    <div className="grid gap-12 p-12">
      <SlideSection name="Slide" />
      <SlideSection name="No slide" $slide={false} />
      {/* Without the popup's enter animation, Ariakit adds data-enter in the
          same update as data-open, before the popup is in place. */}
      <SlideSection name="No popup motion" className="transition-none" />
      <div className="flex gap-24">
        <ScrollSection name="Scroll" />
        <ScrollSection name="Scroll without slide" $slide={false} />
      </div>
    </div>
  );
}
