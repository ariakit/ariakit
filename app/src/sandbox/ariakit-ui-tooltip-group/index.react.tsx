/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import type { TooltipGroupProps } from "@ariakit/ui/components/tooltip.ariakit.react";
import {
  Tooltip,
  TooltipGroup,
} from "@ariakit/ui/components/tooltip.ariakit.react";
import { useEffect, useState } from "react";

const items = ["One", "Two", "Three"];

const scrollItems = Array.from(
  { length: 12 },
  (_, index) => `Item ${index + 1}`,
);

/**
 * Counts the slides of a group's shared popup, which are transform transitions
 * of the wrapper that Ariakit positions. A slide is motion that no attribute
 * reports, so the count is the visible state that the tests read.
 */
function useSlideCount(group: string) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const onTransitionRun = (event: TransitionEvent) => {
      if (event.propertyName !== "transform") return;
      // The listener is on this document, so its targets are from this window.
      if (!(event.target instanceof HTMLElement)) return;
      const popup = event.target.firstElementChild;
      if (popup?.getAttribute("data-group") !== group) return;
      setCount((count) => count + 1);
    };
    document.addEventListener("transitionrun", onTransitionRun);
    return () => document.removeEventListener("transitionrun", onTransitionRun);
  }, [group]);
  return count;
}

interface GroupSectionProps extends TooltipGroupProps {
  name: string;
}

function GroupSection({ name, ...props }: GroupSectionProps) {
  const slides = useSlideCount(name);
  return (
    <section aria-label={name} className="grid justify-items-start gap-2">
      <h2 className="text-sm font-medium">{name}</h2>
      <TooltipGroup data-group={name} {...props}>
        <div className="flex gap-6">
          {items.map((item) => (
            <Tooltip key={item} content={`${item} tooltip`}>
              <Button $kind="bevel">{item}</Button>
            </Tooltip>
          ))}
        </div>
      </TooltipGroup>
      <output className="text-sm">Slides: {slides}</output>
    </section>
  );
}

function ScrollSection({ name, ...props }: GroupSectionProps) {
  const slides = useSlideCount(name);
  return (
    <section aria-label={name} className="grid justify-items-start gap-2">
      <h2 className="text-sm font-medium">{name}</h2>
      <TooltipGroup data-group={name} placement="right" {...props}>
        <div
          role="group"
          aria-label={`${name} list`}
          className="grid h-40 w-32 gap-1 overflow-auto border p-1"
        >
          {scrollItems.map((item) => (
            <Tooltip key={item} content={`${item} tooltip`}>
              <Button>{item}</Button>
            </Tooltip>
          ))}
        </div>
      </TooltipGroup>
      <output className="text-sm">Slides: {slides}</output>
    </section>
  );
}

function EmptySection() {
  return (
    <section
      aria-label="Empty content"
      className="grid justify-items-start gap-2"
    >
      <h2 className="text-sm font-medium">Empty content</h2>
      {/* The first anchor has no tooltip, and it can still get focus. */}
      <TooltipGroup>
        <div className="flex gap-6">
          <Tooltip content={null}>
            <Button $kind="bevel">No tooltip</Button>
          </Tooltip>
          <Tooltip content="Four tooltip">
            <Button $kind="bevel">Four</Button>
          </Tooltip>
        </div>
      </TooltipGroup>
    </section>
  );
}

function BrandSection() {
  const [urgent, setUrgent] = useState(false);
  return (
    <section aria-label="Brand" className="grid justify-items-start gap-2">
      <h2 className="text-sm font-medium">Brand</h2>
      {/* The second tooltip sets a color only while it is urgent. Otherwise,
          it keeps the group color. */}
      <TooltipGroup $layer="brand">
        <div className="flex gap-6">
          <Tooltip content="Five tooltip">
            <Button $kind="bevel">Five</Button>
          </Tooltip>
          <Tooltip content="Six tooltip" $layer={urgent ? "danger" : undefined}>
            <Button $kind="bevel" onClick={() => setUrgent(!urgent)}>
              Six
            </Button>
          </Tooltip>
        </div>
      </TooltipGroup>
    </section>
  );
}

const tags = ["Design", "Research", "Docs"];

function RemovableSection() {
  const [names, setNames] = useState(tags);
  return (
    <section aria-label="Removable" className="grid justify-items-start gap-2">
      <h2 className="text-sm font-medium">Removable</h2>
      {/* A click removes the anchor that the tooltip shows for. */}
      <TooltipGroup>
        <div className="flex gap-6">
          {names.map((name) => (
            <Tooltip key={name} content={`Remove ${name}`}>
              <Button
                $kind="bevel"
                aria-label={`Remove ${name}`}
                onClick={() => {
                  setNames((names) => names.filter((item) => item !== name));
                }}
              >
                {name}
              </Button>
            </Tooltip>
          ))}
        </div>
      </TooltipGroup>
    </section>
  );
}

function LiveSection() {
  const [zoom, setZoom] = useState(100);
  return (
    <section aria-label="Live" className="grid justify-items-start gap-2">
      <h2 className="text-sm font-medium">Live</h2>
      {/* The tooltip of the active anchor updates while it shows. */}
      <TooltipGroup>
        <div className="flex gap-6">
          <Tooltip content={`Zoom out (${zoom}%)`}>
            <Button $kind="bevel" onClick={() => setZoom(zoom - 10)}>
              Zoom out
            </Button>
          </Tooltip>
          <Tooltip content={`Zoom in (${zoom}%)`}>
            <Button $kind="bevel" onClick={() => setZoom(zoom + 10)}>
              Zoom in
            </Button>
          </Tooltip>
        </div>
      </TooltipGroup>
    </section>
  );
}

export default function Example() {
  return (
    <div className="grid gap-12 p-12">
      {/* The first Tab on the page reaches the anchor without content before
          any other tooltip shows. */}
      <EmptySection />
      <GroupSection name="Slide" />
      <GroupSection name="No slide" $slide={false} />
      {/* Without the popup's enter animation, Ariakit adds data-enter in the
          same update as data-open, before the popup is in place. */}
      <GroupSection name="No popup motion" className="transition-none" />
      <div className="flex gap-24">
        <ScrollSection name="Scroll" />
        <ScrollSection name="Scroll without slide" $slide={false} />
      </div>
      <LiveSection />
      <BrandSection />
      <RemovableSection />
    </div>
  );
}
