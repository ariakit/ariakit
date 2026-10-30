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
  TooltipAnchor,
  TooltipArrow,
  TooltipPopover,
  TooltipProvider,
  TooltipSlot,
} from "@ariakit/ui/components/tooltip.ariakit.react";
import { Bold, Check } from "lucide-react";
import {
  Example,
  ExampleGrid,
  ExampleStage,
  openTooltipProps,
} from "#app/components/ariakit-ui-example.react.tsx";

// Held tooltips use the controlled open prop rather than defaultOpen: every
// TooltipAnchor that mounts hides the tooltip that is currently shown, and only
// a controlled prop shows it again.

export default function TooltipExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="Small text on an inverted surface with a medium shadow. The inverted surface stands out from the page, so it has no edge."
        code={`
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>Save</TooltipAnchor>
            <TooltipPopover>Save changes</TooltipPopover>
          </TooltipProvider>
        `}
      >
        <ExampleStage anchor="end" height={22}>
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>
              Save
            </TooltipAnchor>
            <TooltipPopover {...openTooltipProps}>Save changes</TooltipPopover>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="With an arrow"
        description="The arrow takes the fill of the tooltip, so it reads as part of the same surface."
        code={`
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>Share</TooltipAnchor>
            <TooltipPopover>
              <TooltipArrow />
              Copy a link to this page
            </TooltipPopover>
          </TooltipProvider>
        `}
      >
        <ExampleStage anchor="end" height={24}>
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>
              Share
            </TooltipAnchor>
            <TooltipPopover {...openTooltipProps}>
              <TooltipArrow />
              Copy a link to this page
            </TooltipPopover>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Placed below"
        description="The tooltip shows under its anchor, and the arrow points up. This suits a control in a top bar."
        code={`
          <TooltipProvider open placement="bottom">
            <TooltipAnchor render={<Button $kind="bevel" />}>Filters</TooltipAnchor>
            <TooltipPopover>
              <TooltipArrow />
              Show filter options
            </TooltipPopover>
          </TooltipProvider>
        `}
      >
        <ExampleStage anchor="start" height={24}>
          <TooltipProvider open placement="bottom">
            <TooltipAnchor render={<Button $kind="bevel" />}>
              Filters
            </TooltipAnchor>
            <TooltipPopover {...openTooltipProps}>
              <TooltipArrow />
              Show filter options
            </TooltipPopover>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Long label"
        description="A long label wraps at the maximum width of the tooltip and keeps its padding on every line."
        code={`
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>Sync</TooltipAnchor>
            <TooltipPopover>…</TooltipPopover>
          </TooltipProvider>
        `}
      >
        <ExampleStage anchor="end" height={32}>
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>
              Sync
            </TooltipAnchor>
            <TooltipPopover {...openTooltipProps}>
              Sync pulls the latest changes from the remote branch and then
              pushes your local commits to it
            </TooltipPopover>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Rich text"
        description="Text with inline elements and no slot flows as a paragraph, so the emphasis stays on its line."
        code={`
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>Close</TooltipAnchor>
            <TooltipPopover>
              Press <strong>Esc</strong> to close the dialog and go back to
              the <em>page</em> you were reading
            </TooltipPopover>
          </TooltipProvider>
        `}
      >
        <ExampleStage anchor="end" height={32}>
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>
              Close
            </TooltipAnchor>
            <TooltipPopover {...openTooltipProps}>
              Press <strong>Esc</strong> to close the dialog and go back to the{" "}
              <em>page</em> you were reading
            </TooltipPopover>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Icon button with a shortcut"
        description="An icon button named by its label, with its shortcut in a text slot after the tooltip text. The keys are muted and use the UI font, like a plain shortcut in a button."
        code={`
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>
              <ButtonSlot>
                <Bold />
              </ButtonSlot>
            </TooltipAnchor>
            <TooltipPopover>
              Bold
              <TooltipSlot $kind="text">
                <Kbd>⌘B</Kbd>
              </TooltipSlot>
            </TooltipPopover>
          </TooltipProvider>
        `}
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
            >
              <ButtonSlot>
                <Bold />
              </ButtonSlot>
            </TooltipAnchor>
            <TooltipPopover {...openTooltipProps}>
              Bold
              <TooltipSlot $kind="text">
                <Kbd>⌘B</Kbd>
              </TooltipSlot>
            </TooltipPopover>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Boxed shortcut"
        description="A bordered flat key fills a line-tall slot that is not square, so the chip is as tall as a line of the tooltip text and sits as far from the text as from the side."
        code={`
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>Search</TooltipAnchor>
            <TooltipPopover>
              Search
              <TooltipSlot $square={false} $size="xl">
                <Kbd $kind="flat" $layer="transparent" $border>
                  ⌘K
                </Kbd>
              </TooltipSlot>
            </TooltipPopover>
          </TooltipProvider>
        `}
      >
        <ExampleStage anchor="end" height={22}>
          <TooltipProvider open>
            <TooltipAnchor
              render={<Button $kind="bevel" aria-keyshortcuts="Meta+K" />}
            >
              Search
            </TooltipAnchor>
            <TooltipPopover {...openTooltipProps}>
              Search
              <TooltipSlot $square={false} $size="xl">
                <Kbd $kind="flat" $layer="transparent" $border>
                  ⌘K
                </Kbd>
              </TooltipSlot>
            </TooltipPopover>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Leading icon"
        description="An icon slot before the tooltip text moves into the side padding, like the icon of a button."
        code={`
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>Copy</TooltipAnchor>
            <TooltipPopover>
              <TooltipSlot>
                <Check />
              </TooltipSlot>
              Copied
            </TooltipPopover>
          </TooltipProvider>
        `}
      >
        <ExampleStage anchor="end" height={22}>
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>
              Copy
            </TooltipAnchor>
            <TooltipPopover {...openTooltipProps}>
              <TooltipSlot>
                <Check />
              </TooltipSlot>
              Copied
            </TooltipPopover>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Badge slot"
        description="A badge slot after the tooltip text, sized and spaced like a badge in a button."
        code={`
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>Inbox</TooltipAnchor>
            <TooltipPopover>
              Unread messages
              <TooltipSlot $kind="badge">3</TooltipSlot>
            </TooltipPopover>
          </TooltipProvider>
        `}
      >
        <ExampleStage anchor="end" height={22}>
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>
              Inbox
            </TooltipAnchor>
            <TooltipPopover {...openTooltipProps}>
              Unread messages
              <TooltipSlot $kind="badge">3</TooltipSlot>
            </TooltipPopover>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Pill"
        description="A fully rounded tooltip. Popover surfaces force their radius, so it does not adapt to the box around it."
        code={`
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>Like</TooltipAnchor>
            <TooltipPopover $rounded="full">Like this post</TooltipPopover>
          </TooltipProvider>
        `}
      >
        <ExampleStage anchor="end" height={22}>
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>
              Like
            </TooltipAnchor>
            <TooltipPopover {...openTooltipProps} $rounded="full">
              Like this post
            </TooltipPopover>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Roomy padding"
        description="More padding. The sides add the optical inset of the text to the frame padding, so both axes grow together."
        code={`
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>Export</TooltipAnchor>
            <TooltipPopover $p={2}>Download as CSV</TooltipPopover>
          </TooltipProvider>
        `}
      >
        <ExampleStage anchor="end" height={24}>
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>
              Export
            </TooltipAnchor>
            <TooltipPopover {...openTooltipProps} $p={2}>
              Download as CSV
            </TooltipPopover>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Brand"
        description="A brand-colored tooltip keeps its hue instead of inverting. The ink turns light, and the arrow takes the brand fill and the edge."
        code={`
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>Upgrade</TooltipAnchor>
            <TooltipPopover $layer="brand">
              <TooltipArrow />
              New in Pro
            </TooltipPopover>
          </TooltipProvider>
        `}
      >
        <ExampleStage anchor="end" height={24}>
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>
              Upgrade
            </TooltipAnchor>
            <TooltipPopover {...openTooltipProps} $layer="brand">
              <TooltipArrow />
              New in Pro
            </TooltipPopover>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Surface"
        description="A tooltip on the popover surface instead of the inverted one, with an adaptive edge. The arrow follows the fill and the edge."
        code={`
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>Delete</TooltipAnchor>
            <TooltipPopover $invert={false}>
              <TooltipArrow />
              Delete permanently
            </TooltipPopover>
          </TooltipProvider>
        `}
      >
        <ExampleStage anchor="end" height={24}>
          <TooltipProvider open>
            <TooltipAnchor render={<Button $kind="bevel" />}>
              Delete
            </TooltipAnchor>
            <TooltipPopover {...openTooltipProps} $invert={false}>
              <TooltipArrow />
              Delete permanently
            </TooltipPopover>
          </TooltipProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Hover or focus"
        description="The live tooltip, closed at rest. It opens in a portal on hover or keyboard focus, and closes on Escape or when the anchor loses focus."
        code={`
          <TooltipProvider>
            <TooltipAnchor render={<Button $kind="bevel" />}>Publish</TooltipAnchor>
            <TooltipPopover>…</TooltipPopover>
          </TooltipProvider>
        `}
      >
        <TooltipProvider>
          <TooltipAnchor render={<Button $kind="bevel" />}>
            Publish
          </TooltipAnchor>
          {/*
            TooltipPopover unmounts while hidden: this sandbox holds other
            tooltips open, and a live tooltip that already exists when they open
            is marked as outside them and ignores Escape.
            https://github.com/ariakit/ariakit/issues/7463
          */}
          <TooltipPopover>Publish to the public site</TooltipPopover>
        </TooltipProvider>
      </Example>
    </ExampleGrid>
  );
}
