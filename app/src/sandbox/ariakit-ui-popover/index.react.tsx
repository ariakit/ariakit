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
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import {
  Popover,
  PopoverArrow,
  PopoverDescription,
  PopoverDisclosure,
  PopoverDismiss,
  PopoverHeading,
  PopoverProvider,
  PopoverScroll,
} from "@ariakit/ui/components/popover.ariakit.react";
import {
  Example,
  ExampleGrid,
  ExampleStage,
  openPopoverProps,
} from "#app/components/ariakit-ui-example.react.tsx";

const releaseNotes = [
  "Popovers now lift off the surface behind them and take an adaptive edge, so they read as raised material on light and dark pages alike.",
  "Dialogs cap their height to the visual viewport, so a virtual keyboard shrinks them instead of covering their actions.",
  "Tooltips wrap long labels instead of running across the page, and keep their padding on every line.",
];

export default function PopoverExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="A raised surface with an adaptive edge and a large shadow. The footer covers the bottom of the popover, and its corners stay concentric."
        code={`
          <PopoverProvider defaultOpen>
            <PopoverDisclosure $kind="bevel">Accept invite</PopoverDisclosure>
            <Popover>
              <PopoverHeading>Team meeting</PopoverHeading>
              <PopoverDescription>…</PopoverDescription>
              <Frame $cover $p={2}>
                <Button $kind="bevel">Accept</Button>
              </Frame>
            </Popover>
          </PopoverProvider>
        `}
      >
        <ExampleStage anchor="start" height={58}>
          <PopoverProvider defaultOpen>
            <PopoverDisclosure $kind="bevel">Accept invite</PopoverDisclosure>
            <Popover
              {...openPopoverProps}
              className="flex max-w-72 flex-col gap-2"
            >
              <PopoverHeading>Team meeting</PopoverHeading>
              <PopoverDescription>
                We are going to discuss what we have achieved on the project.
              </PopoverDescription>
              <Frame $cover $p={2} className="grid">
                <Button $kind="bevel">Accept</Button>
              </Frame>
            </Popover>
          </PopoverProvider>
        </ExampleStage>
      </Example>

      <Example
        title="With an arrow"
        description="The arrow takes the fill and the edge of the popover, so it reads as part of the same surface."
        code={`
          <PopoverProvider defaultOpen>
            <PopoverDisclosure $kind="bevel">Details</PopoverDisclosure>
            <Popover>
              <PopoverArrow />
              <PopoverHeading>Team meeting</PopoverHeading>
              <PopoverDescription>…</PopoverDescription>
            </Popover>
          </PopoverProvider>
        `}
      >
        <ExampleStage anchor="start" height={42}>
          <PopoverProvider defaultOpen>
            <PopoverDisclosure $kind="bevel">Details</PopoverDisclosure>
            <Popover
              {...openPopoverProps}
              className="flex max-w-72 flex-col gap-2"
            >
              <PopoverArrow />
              <PopoverHeading>Team meeting</PopoverHeading>
              <PopoverDescription>
                Thursday at 10:00, room 4.
              </PopoverDescription>
            </Popover>
          </PopoverProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Medium shadow"
        description="A lighter shadow, the one that the tooltip uses by default."
        code={`
          <PopoverProvider defaultOpen>
            <PopoverDisclosure $kind="bevel">Filters</PopoverDisclosure>
            <Popover $shadow="md">
              <PopoverHeading>Filters</PopoverHeading>
              <PopoverDescription>Show only open issues.</PopoverDescription>
            </Popover>
          </PopoverProvider>
        `}
      >
        <ExampleStage anchor="start" height={38}>
          <PopoverProvider defaultOpen>
            <PopoverDisclosure $kind="bevel">Filters</PopoverDisclosure>
            <Popover
              {...openPopoverProps}
              $shadow="md"
              className="flex max-w-72 flex-col gap-2"
            >
              <PopoverHeading>Filters</PopoverHeading>
              <PopoverDescription>Show only open issues.</PopoverDescription>
            </Popover>
          </PopoverProvider>
        </ExampleStage>
      </Example>

      <Example
        title="No shadow"
        description="Only the lift and the adaptive edge separate the popover from the surface behind it."
        code={`
          <PopoverProvider defaultOpen>
            <PopoverDisclosure $kind="bevel">Sort</PopoverDisclosure>
            <Popover $shadow="none">
              <PopoverHeading>Sort</PopoverHeading>
              <PopoverDescription>Newest issues first.</PopoverDescription>
            </Popover>
          </PopoverProvider>
        `}
      >
        <ExampleStage anchor="start" height={38}>
          <PopoverProvider defaultOpen>
            <PopoverDisclosure $kind="bevel">Sort</PopoverDisclosure>
            <Popover
              {...openPopoverProps}
              $shadow="none"
              className="flex max-w-72 flex-col gap-2"
            >
              <PopoverHeading>Sort</PopoverHeading>
              <PopoverDescription>Newest issues first.</PopoverDescription>
            </Popover>
          </PopoverProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Without an edge"
        description="No border or ring. The shadow and the lift carry the separation, which is faint on a dark page."
        code={`
          <PopoverProvider defaultOpen>
            <PopoverDisclosure $kind="bevel">Profile</PopoverDisclosure>
            <Popover $border={false}>
              <PopoverHeading>Alex Rivera</PopoverHeading>
              <PopoverDescription>Maintainer since 2018.</PopoverDescription>
            </Popover>
          </PopoverProvider>
        `}
      >
        <ExampleStage anchor="start" height={38}>
          <PopoverProvider defaultOpen>
            <PopoverDisclosure $kind="bevel">Profile</PopoverDisclosure>
            <Popover
              {...openPopoverProps}
              $border={false}
              className="flex max-w-72 flex-col gap-2"
            >
              <PopoverHeading>Alex Rivera</PopoverHeading>
              <PopoverDescription>Maintainer since 2018.</PopoverDescription>
            </Popover>
          </PopoverProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Compact frame"
        description="A smaller radius and less padding. The nested button follows them, so its corners stay concentric with the popover."
        code={`
          <PopoverProvider defaultOpen>
            <PopoverDisclosure $kind="bevel">Share</PopoverDisclosure>
            <Popover $rounded="xl" $p={2}>
              <PopoverDescription>…</PopoverDescription>
              <Button $kind="bevel">Copy link</Button>
            </Popover>
          </PopoverProvider>
        `}
      >
        <ExampleStage anchor="start" height={44}>
          <PopoverProvider defaultOpen>
            <PopoverDisclosure $kind="bevel">Share</PopoverDisclosure>
            <Popover
              {...openPopoverProps}
              $rounded="xl"
              $p={2}
              aria-label="Share"
              className="flex max-w-56 flex-col gap-2"
            >
              <PopoverDescription>
                Anyone with the link can view.
              </PopoverDescription>
              <Button $kind="bevel">Copy link</Button>
            </Popover>
          </PopoverProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Brand callout"
        description="A brand-colored popover for a feature tour. The ink, the arrow and the nested button follow the brand color."
        code={`
          <PopoverProvider defaultOpen>
            <PopoverDisclosure $kind="bevel">Views</PopoverDisclosure>
            <Popover $layer="brand">
              <PopoverArrow />
              <PopoverHeading>New: saved views</PopoverHeading>
              <PopoverDescription>…</PopoverDescription>
              <PopoverDismiss $kind="bevel">Got it</PopoverDismiss>
            </Popover>
          </PopoverProvider>
        `}
      >
        <ExampleStage anchor="start" height={62}>
          <PopoverProvider defaultOpen>
            <PopoverDisclosure $kind="bevel">Views</PopoverDisclosure>
            <Popover
              {...openPopoverProps}
              $layer="brand"
              className="flex max-w-64 flex-col items-start gap-2"
            >
              <PopoverArrow />
              <PopoverHeading>New: saved views</PopoverHeading>
              <PopoverDescription>
                Pin a filter set and reach it from the sidebar.
              </PopoverDescription>
              <PopoverDismiss $kind="bevel">Got it</PopoverDismiss>
            </Popover>
          </PopoverProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Close button"
        description="A dismiss without children is a square icon button, ready for the end of a heading row."
        code={`
          <PopoverProvider defaultOpen>
            <PopoverDisclosure $kind="bevel">Notifications</PopoverDisclosure>
            <Popover>
              <PopoverHeading>Notifications</PopoverHeading>
              <PopoverDismiss />
              <PopoverDescription>You are all caught up.</PopoverDescription>
            </Popover>
          </PopoverProvider>
        `}
      >
        <ExampleStage anchor="start" height={42}>
          <PopoverProvider defaultOpen>
            <PopoverDisclosure $kind="bevel">Notifications</PopoverDisclosure>
            <Popover
              {...openPopoverProps}
              className="flex w-72 max-w-full flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <PopoverHeading>Notifications</PopoverHeading>
                <PopoverDismiss />
              </div>
              <PopoverDescription>You are all caught up.</PopoverDescription>
            </Popover>
          </PopoverProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Form with a dismiss"
        description="A field and actions on the raised surface. The field sinks into it, and Cancel closes the popover."
        code={`
          <PopoverProvider defaultOpen>
            <PopoverDisclosure $kind="bevel">Rename</PopoverDisclosure>
            <Popover>
              <PopoverHeading>Rename branch</PopoverHeading>
              <Input />
              <PopoverDismiss>Cancel</PopoverDismiss>
              <Button $layer="brand" $kind="bevel">Rename</Button>
            </Popover>
          </PopoverProvider>
        `}
      >
        <ExampleStage anchor="start" height={58}>
          <PopoverProvider defaultOpen>
            <PopoverDisclosure $kind="bevel">Rename</PopoverDisclosure>
            <Popover
              {...openPopoverProps}
              className="flex max-w-80 flex-col gap-3"
            >
              <PopoverHeading>Rename branch</PopoverHeading>
              <Input
                defaultValue="feature/ariakit-ui"
                aria-label="Branch name"
              />
              <div className="flex justify-end gap-2">
                <PopoverDismiss>Cancel</PopoverDismiss>
                <Button $layer="brand" $kind="bevel">
                  Rename
                </Button>
              </div>
            </Popover>
          </PopoverProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Scroll"
        description="The max-h-48 class caps the popover. Content taller than the cap scrolls inside the rounded frame."
        code={`
          <PopoverProvider defaultOpen>
            <PopoverDisclosure $kind="bevel">Release notes</PopoverDisclosure>
            <Popover>
              <PopoverScroll>
                <PopoverHeading>Release notes</PopoverHeading>
                <PopoverDescription>…</PopoverDescription>
                <PopoverDescription>…</PopoverDescription>
                <PopoverDescription>…</PopoverDescription>
              </PopoverScroll>
            </Popover>
          </PopoverProvider>
        `}
      >
        <ExampleStage anchor="start" height={64}>
          <PopoverProvider defaultOpen>
            <PopoverDisclosure $kind="bevel">Release notes</PopoverDisclosure>
            <Popover
              {...openPopoverProps}
              className="flex max-h-48 max-w-72 flex-col"
            >
              <PopoverScroll className="grid gap-2">
                <PopoverHeading>Release notes</PopoverHeading>
                {releaseNotes.map((note) => (
                  <PopoverDescription key={note}>{note}</PopoverDescription>
                ))}
              </PopoverScroll>
            </Popover>
          </PopoverProvider>
        </ExampleStage>
      </Example>

      <Example
        title="Opened on click"
        description="The live popover, closed at rest. It opens in a portal and takes focus, and Escape or a click outside closes it."
        code={`
          <PopoverProvider>
            <PopoverDisclosure $kind="bevel">Event details</PopoverDisclosure>
            <Popover>
              <PopoverHeading>Design review</PopoverHeading>
              <PopoverDescription>Friday at 14:00, room 2.</PopoverDescription>
              <PopoverDismiss $kind="bevel">Close</PopoverDismiss>
            </Popover>
          </PopoverProvider>
        `}
      >
        <PopoverProvider>
          <PopoverDisclosure $kind="bevel">Event details</PopoverDisclosure>
          {/*
            Portaled and unmounted on hide: this sandbox holds other popovers
            open, and a live popover that already exists when they open is
            marked as outside them and ignores Escape.
            https://github.com/ariakit/ariakit/issues/7463
          */}
          <Popover
            portal
            unmountOnHide
            className="flex max-w-72 flex-col gap-2"
          >
            <PopoverHeading>Design review</PopoverHeading>
            <PopoverDescription>Friday at 14:00, room 2.</PopoverDescription>
            <div className="flex justify-end">
              <PopoverDismiss $kind="bevel">Close</PopoverDismiss>
            </div>
          </Popover>
        </PopoverProvider>
      </Example>

      {/*
        Regression fixtures: an icon-only dismiss whose label prop is present
        but undefined.
      */}
    </ExampleGrid>
  );
}
