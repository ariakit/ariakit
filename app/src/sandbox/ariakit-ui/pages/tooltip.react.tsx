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
} from "@ariakit/ui/components/button.ariakit.react";
import { Kbd } from "@ariakit/ui/components/kbd.ariakit.react";
import {
  Tooltip,
  TooltipAnchor,
  TooltipArrow,
  TooltipProvider,
} from "@ariakit/ui/components/tooltip.ariakit.react";
import { Bold } from "lucide-react";
import {
  Example,
  ExampleGrid,
  ExampleStage,
  openTooltipProps,
  screenshotFocus,
} from "../example.react.tsx";

// Held tooltips use the controlled open prop rather than defaultOpen: every
// TooltipAnchor that mounts hides the tooltip that is currently shown, and only
// a controlled prop shows it again.

export function TooltipExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="Small text on a raised surface with an adaptive edge and a medium shadow."
      >
        <ExampleStage anchor="end" height={22}>
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>
              Save
            </TooltipAnchor>
            <Tooltip {...openTooltipProps}>Save changes</Tooltip>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="With an arrow"
        description="The arrow takes the fill and the edge of the tooltip, so it reads as part of the same surface."
      >
        <ExampleStage anchor="end" height={24}>
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>
              Share
            </TooltipAnchor>
            <Tooltip {...openTooltipProps}>
              <TooltipArrow />
              Copy a link to this page
            </Tooltip>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Placed below"
        description="The tooltip shows under its anchor, and the arrow points up. This suits a control in a top bar."
      >
        <ExampleStage anchor="start" height={24}>
          <TooltipProvider open placement="bottom">
            <TooltipAnchor render={<Button $kind="bevel" />}>
              Filters
            </TooltipAnchor>
            <Tooltip {...openTooltipProps}>
              <TooltipArrow />
              Show filter options
            </Tooltip>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Long label"
        description="A long label wraps at the maximum width of the tooltip and keeps its padding on every line."
      >
        <ExampleStage anchor="end" height={32}>
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>
              Sync
            </TooltipAnchor>
            <Tooltip {...openTooltipProps}>
              Sync pulls the latest changes from the remote branch and then
              pushes your local commits to it
            </Tooltip>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Icon button with a shortcut"
        description="An icon button named by its label, with key caps in the tooltip. The caps take their color from the tooltip surface."
      >
        <ExampleStage anchor="end" height={22}>
          <TooltipProvider open>
            <TooltipAnchor
              render={
                <Button
                  $kind="bevel"
                  aria-label="Bold"
                  aria-keyshortcuts="Meta+B"
                />
              }
              {...screenshotFocus}
            >
              <ButtonSlot>
                <Bold />
              </ButtonSlot>
            </TooltipAnchor>
            <Tooltip {...openTooltipProps}>
              Bold <Kbd>⌘</Kbd> <Kbd>B</Kbd>
            </Tooltip>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Pill"
        description="A fully rounded tooltip. Popover surfaces force their radius, so it does not adapt to the box around it."
      >
        <ExampleStage anchor="end" height={22}>
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>
              Like
            </TooltipAnchor>
            <Tooltip {...openTooltipProps} $rounded="full">
              Like this post
            </Tooltip>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Roomy padding"
        description="More padding. The sides stay at twice the frame padding, so both axes grow together."
      >
        <ExampleStage anchor="end" height={24}>
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>
              Export
            </TooltipAnchor>
            <Tooltip {...openTooltipProps} $p={2}>
              Download as CSV
            </Tooltip>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Brand"
        description="A brand-colored tooltip. The ink turns light, and the arrow takes the brand fill."
      >
        <ExampleStage anchor="end" height={24}>
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>
              Upgrade
            </TooltipAnchor>
            <Tooltip {...openTooltipProps} $layer="brand">
              <TooltipArrow />
              New in Pro
            </Tooltip>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Inverted"
        description="The classic contrasting tooltip: dark on a light page and light on a dark page. The arrow follows the fill."
      >
        <ExampleStage anchor="end" height={24}>
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>
              Delete
            </TooltipAnchor>
            <Tooltip {...openTooltipProps} $invert>
              <TooltipArrow />
              Delete permanently
            </Tooltip>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Hover or focus"
        description="The live tooltip, closed at rest. It opens in a portal on hover or keyboard focus, and closes on Escape or when the anchor loses focus."
      >
        <TooltipProvider>
          <TooltipAnchor render={<Button $kind="bevel" />}>
            Publish
          </TooltipAnchor>
          {/*
            Unmounted on hide: this route holds other tooltips open, and a live
            tooltip that already exists when they open is marked as outside
            them and ignores Escape.
            https://github.com/ariakit/ariakit/issues/7463
          */}
          <Tooltip unmountOnHide>Publish to the public site</Tooltip>
        </TooltipProvider>
      </Example>
    </ExampleGrid>
  );
}

export default TooltipExamples;
