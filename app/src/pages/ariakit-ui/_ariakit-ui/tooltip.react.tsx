/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import {
  Button,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react.tsx";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react.tsx";
import type {
  TooltipProps,
  TooltipProviderProps,
} from "@ariakit/ui/components/tooltip.ariakit.react.tsx";
import {
  Tooltip,
  TooltipAnchor,
  TooltipArrow,
  TooltipProvider,
} from "@ariakit/ui/components/tooltip.ariakit.react.tsx";
import { clsx } from "clsx";
import * as icons from "lucide-react";
import type * as React from "react";
import { Caption, Sample, Samples, Stage } from "./gallery.react.tsx";

const placements = ["top", "bottom", "left", "right"] as const;

interface OpenTooltipProps extends TooltipProps {
  label?: React.ReactNode;
  placement?: NonNullable<TooltipProviderProps["placement"]>;
  arrow?: boolean;
}

/**
 * A tooltip held open inside its card. The provider owns the open state and the
 * tooltip lays out inside the stage instead of a portal.
 */
function OpenTooltip({
  label = "Anchor",
  placement = "top",
  arrow,
  children,
  ...props
}: OpenTooltipProps) {
  // The anchor sits at the edge the tooltip points away from, so the label has
  // the rest of the stage to itself.
  const below = placement.startsWith("bottom");
  return (
    <div
      className={clsx(
        "relative flex min-h-36 justify-center",
        below ? "items-start pt-2" : "items-end pb-2",
      )}
    >
      <TooltipProvider open placement={placement}>
        <TooltipAnchor render={<Button />}>{label}</TooltipAnchor>
        <Tooltip
          portal={false}
          // Pinned to its placement: the position is computed against the
          // viewport, and a stage far down the page would otherwise flip or
          // slide the tooltip away from its anchor.
          flip={false}
          slide={false}
          {...props}
        >
          {arrow && <TooltipArrow />}
          {children}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export function TooltipSection() {
  return (
    <Samples>
      <Sample
        title="Interactive"
        code="TooltipProvider > TooltipAnchor render={<Button />} + Tooltip"
        description="Hover or focus the anchors. The label appears after a short delay and scales in from the anchor side."
      >
        <Stage>
          <TooltipProvider>
            <TooltipAnchor render={<Button />}>Hover me</TooltipAnchor>
            <Tooltip>A short label</Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <TooltipAnchor render={<Button aria-label="Bold" />}>
              <ButtonSlot>
                <icons.Bold />
              </ButtonSlot>
            </TooltipAnchor>
            <Tooltip>Bold (⌘B)</Tooltip>
          </TooltipProvider>
          <TooltipProvider timeout={0}>
            <TooltipAnchor render={<Button />}>No delay</TooltipAnchor>
            <Tooltip>Shown immediately</Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <TooltipAnchor render={<Button />}>With an arrow</TooltipAnchor>
            <Tooltip>
              <TooltipArrow />
              The arrow points at the anchor
            </Tooltip>
          </TooltipProvider>
        </Stage>
      </Sample>

      <Sample
        title="Placements"
        code='TooltipProvider placement="top" | "bottom" | "left" | "right"'
        description="Hover each anchor to see the tooltip on that side."
      >
        <Stage>
          {placements.map((placement) => (
            <TooltipProvider key={placement} placement={placement}>
              <TooltipAnchor render={<Button />}>{placement}</TooltipAnchor>
              <Tooltip>Placed {placement}</Tooltip>
            </TooltipProvider>
          ))}
        </Stage>
      </Sample>

      <Sample
        title="Open"
        code="TooltipProvider open · Tooltip portal={false}"
        description="The default label held open above its anchor: small text, a large radius, one step of padding and the medium shadow."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <OpenTooltip>A short label</OpenTooltip>
          <OpenTooltip arrow>With an arrow</OpenTooltip>
          <OpenTooltip placement="bottom">Placed below</OpenTooltip>
          <OpenTooltip className="max-w-48">
            A longer label that wraps onto more than one line inside the tooltip
          </OpenTooltip>
        </div>
      </Sample>

      <Sample
        title="Open variants"
        code='$shadow="none" | "xl" · $rounded="full" · $p={2} · $layer="brand" · $invert'
        description="The tooltip is a popover, so the shadow, radius, padding and color knobs apply."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <OpenTooltip $shadow="none">No shadow</OpenTooltip>
          <OpenTooltip $shadow="xl">Extra-large shadow</OpenTooltip>
          <OpenTooltip $rounded="full">Pill</OpenTooltip>
          <OpenTooltip $p={2}>More padding</OpenTooltip>
          <OpenTooltip $layer="brand" arrow>
            Brand
          </OpenTooltip>
          <OpenTooltip $invert arrow>
            Inverted
          </OpenTooltip>
        </div>
      </Sample>

      <Sample
        title="On layers"
        code="Tooltip inside Layer"
        description="A lifted surface resolves its edge as a border over dark content and a ring over light content."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Layer $invert className="grid gap-2 rounded-xl p-4">
            <Caption>Inverted</Caption>
            <OpenTooltip arrow>On an inverted layer</OpenTooltip>
          </Layer>
          <Layer $layer="brand" className="grid gap-2 rounded-xl p-4">
            <Caption>Brand</Caption>
            <OpenTooltip arrow>On a brand layer</OpenTooltip>
          </Layer>
        </div>
      </Sample>
    </Samples>
  );
}
