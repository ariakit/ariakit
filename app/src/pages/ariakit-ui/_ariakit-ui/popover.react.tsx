/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Button } from "@ariakit/ui/components/button.ariakit.react.tsx";
import { Input } from "@ariakit/ui/components/input.ariakit.react.tsx";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react.tsx";
import type {
  PopoverProps,
  PopoverProviderProps,
} from "@ariakit/ui/components/popover.ariakit.react.tsx";
import {
  Popover,
  PopoverArrow,
  PopoverDescription,
  PopoverDisclosure,
  PopoverDismiss,
  PopoverHeading,
  PopoverProvider,
  PopoverScroll,
} from "@ariakit/ui/components/popover.ariakit.react.tsx";
import { Text } from "@ariakit/ui/components/text.ariakit.react.tsx";
import { clsx } from "clsx";
import type * as React from "react";
import { Caption, Sample, Samples, Stage, LOREM } from "./gallery.react.tsx";

const placements = ["top", "bottom", "left", "right"] as const;

function MeetingContent() {
  return (
    <>
      <PopoverHeading>Team meeting</PopoverHeading>
      <PopoverDescription>
        We are going to discuss what we have achieved on the project.
      </PopoverDescription>
      <div className="ak-frame ak-frame-cover ak-frame-p-2 grid">
        <Button $kind="bevel">Accept</Button>
      </div>
    </>
  );
}

interface OpenPopoverProps extends PopoverProps {
  label?: React.ReactNode;
  placement?: PopoverProviderProps["placement"];
  arrow?: boolean;
  /** The stage height, which must fit the popover and its anchor. */
  stageClassName?: string;
}

/**
 * A popover held open inside its card. The provider owns the open state, the
 * popover lays out inside the stage instead of a portal, and focus stays
 * where it was so the page does not jump on load.
 */
function OpenPopover({
  label = "Anchor",
  placement = "bottom",
  arrow,
  stageClassName,
  children,
  // A width the caller can lower where the stage is narrow, since two
  // max-w utilities on one element would compete by stylesheet order.
  className = "max-w-72",
  ...props
}: OpenPopoverProps) {
  return (
    <div
      className={clsx(
        "relative flex min-h-64 justify-center pt-3",
        stageClassName,
      )}
    >
      <PopoverProvider open placement={placement}>
        <PopoverDisclosure className="h-max">{label}</PopoverDisclosure>
        <Popover
          portal={false}
          gutter={arrow ? undefined : 8}
          // Pinned to its placement: the position is computed against the
          // viewport, and a stage far down the page would otherwise flip or
          // slide the popover away from its anchor.
          flip={false}
          slide={false}
          autoFocusOnShow={false}
          hideOnInteractOutside={false}
          hideOnEscape={false}
          className={clsx("flex flex-col gap-2", className)}
          {...props}
        >
          {arrow && <PopoverArrow />}
          {children}
        </Popover>
      </PopoverProvider>
    </div>
  );
}

export function PopoverSection() {
  return (
    <Samples>
      <Sample
        title="Interactive"
        code="PopoverProvider > PopoverDisclosure + Popover > PopoverArrow + PopoverHeading + PopoverDescription"
        description="Open the popover to see it scale in from the anchor side. It closes on Escape or a click outside."
      >
        <Stage>
          <PopoverProvider>
            <PopoverDisclosure $kind="bevel">Accept invite</PopoverDisclosure>
            <Popover className="flex max-w-80 flex-col gap-2">
              <PopoverArrow />
              <MeetingContent />
            </Popover>
          </PopoverProvider>
          <PopoverProvider>
            <PopoverDisclosure>With a dismiss</PopoverDisclosure>
            <Popover className="flex max-w-80 flex-col gap-3">
              <PopoverHeading>Rename branch</PopoverHeading>
              <Input
                defaultValue="feature/ariakit-ui"
                aria-label="Branch name"
              />
              <div className="flex justify-end gap-2">
                <PopoverDismiss render={<Button />}>Cancel</PopoverDismiss>
                <Button $layer="brand" $kind="bevel">
                  Rename
                </Button>
              </div>
            </Popover>
          </PopoverProvider>
        </Stage>
      </Sample>

      <Sample
        title="Placements"
        code='PopoverProvider placement="top" | "bottom" | "left" | "right"'
        description="The popover scales from the side it is anchored to. Open each one."
      >
        <Stage>
          {placements.map((placement) => (
            <PopoverProvider key={placement} placement={placement}>
              <PopoverDisclosure>{placement}</PopoverDisclosure>
              <Popover className="flex max-w-64 flex-col gap-2">
                <PopoverArrow />
                <PopoverHeading>Placed {placement}</PopoverHeading>
                <PopoverDescription>
                  The arrow points at the anchor.
                </PopoverDescription>
              </Popover>
            </PopoverProvider>
          ))}
        </Stage>
      </Sample>

      <Sample
        title="Open"
        code="PopoverProvider open · Popover portal={false}"
        description="The default surface held open below its anchor: lifted, bordered, a 2xl radius and the extra-large shadow."
      >
        <OpenPopover>
          <MeetingContent />
        </OpenPopover>
      </Sample>

      <Sample
        title="Open with an arrow"
        code="PopoverArrow"
        description="The arrow is drawn by Ariakit and takes the popover's own surface and edge."
      >
        <OpenPopover arrow>
          <MeetingContent />
        </OpenPopover>
      </Sample>

      <Sample
        title="Shadows"
        code='$shadow="none" | "md" | "xl"'
        description="The shadow is a variant so extending styles like the tooltip can lighten it."
      >
        <div className="grid gap-2 sm:grid-cols-3">
          <OpenPopover label="none" $shadow="none" stageClassName="min-h-48">
            <PopoverDescription>$shadow="none"</PopoverDescription>
          </OpenPopover>
          <OpenPopover label="md" $shadow="md" stageClassName="min-h-48">
            <PopoverDescription>$shadow="md"</PopoverDescription>
          </OpenPopover>
          <OpenPopover label="xl" stageClassName="min-h-48">
            <PopoverDescription>$shadow="xl"</PopoverDescription>
          </OpenPopover>
        </div>
      </Sample>

      <Sample
        title="Frame and layer"
        code='$rounded="lg" $p={2} · $lighten={false} · $border={false} · $layer="brand"'
        description="The popover is a frame, so the radius, padding, lift, edge and color are all open."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <OpenPopover
            className="max-w-52"
            label="Compact"
            $rounded="lg"
            $p={2}
            stageClassName="min-h-48"
          >
            <PopoverDescription>A compact popover.</PopoverDescription>
          </OpenPopover>
          <OpenPopover
            className="max-w-52"
            label="Flat"
            $lighten={false}
            $lightnessOffset
            stageClassName="min-h-48"
          >
            <PopoverDescription>
              The adaptive offset instead of a lift.
            </PopoverDescription>
          </OpenPopover>
          <OpenPopover
            className="max-w-52"
            label="No edge"
            $border={false}
            stageClassName="min-h-48"
          >
            <PopoverDescription>
              Shadow only, no border or ring.
            </PopoverDescription>
          </OpenPopover>
          <OpenPopover
            className="max-w-52"
            label="Brand"
            $layer="brand"
            stageClassName="min-h-48"
          >
            <PopoverHeading>Brand surface</PopoverHeading>
            <PopoverDescription>The ink follows the layer.</PopoverDescription>
          </OpenPopover>
        </div>
      </Sample>

      <Sample
        title="Scroll"
        code="PopoverScroll"
        description="A viewport covering the content box, for popovers whose content outgrows the available height."
      >
        <OpenPopover
          label="Long content"
          className="max-h-48 max-w-72"
          stageClassName="min-h-72"
        >
          <PopoverScroll className="grid gap-2">
            <PopoverHeading>Release notes</PopoverHeading>
            <PopoverDescription>{LOREM}</PopoverDescription>
            <PopoverDescription>{LOREM}</PopoverDescription>
            <PopoverDescription>{LOREM}</PopoverDescription>
          </PopoverScroll>
        </OpenPopover>
      </Sample>

      <Sample
        title="On layers"
        code="Popover inside Layer"
        description="A lifted surface resolves its edge as a border over dark content and a ring over light content."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Layer $invert className="grid gap-2 rounded-xl p-4">
            <Caption>Inverted</Caption>
            <OpenPopover className="max-w-48" stageClassName="min-h-48">
              <PopoverHeading>On an inverted layer</PopoverHeading>
              <Text>The popover lifts toward the light.</Text>
            </OpenPopover>
          </Layer>
          <Layer $layer="brand" className="grid gap-2 rounded-xl p-4">
            <Caption>Brand</Caption>
            <OpenPopover className="max-w-48" stageClassName="min-h-48">
              <PopoverHeading>On a brand layer</PopoverHeading>
              <Text>The popover keeps the hue and lifts.</Text>
            </OpenPopover>
          </Layer>
        </div>
      </Sample>
    </Samples>
  );
}
