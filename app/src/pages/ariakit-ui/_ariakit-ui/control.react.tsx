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
  Control,
  ControlContent,
  ControlDescription,
  ControlGroup,
  ControlLabel,
  ControlSeparator,
  ControlSlot,
} from "@ariakit/ui/components/control.ariakit.react.tsx";
import * as icons from "lucide-react";
import * as React from "react";
import { Labeled, Sample, Samples, Stage } from "./gallery.react.tsx";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
const slotSizes = ["xs", "sm", "md", "lg", "xl", "2xl", "full"] as const;
const gaps = ["none", "sm", "md", "lg", "xl"] as const;
const paddings = ["sm", "md", "lg", "xl"] as const;
const separatorKinds = ["pipe", "slash", "chevron"] as const;
const separatorSizes = ["xs", "sm", "md", "lg", "full"] as const;

export function ControlSection() {
  return (
    <Samples>
      <Sample
        title="Anatomy"
        code="Control > ControlSlot + ControlContent (ControlLabel + ControlDescription) + ControlSlot"
        description="A non-interactive row with every part in place: an avatar spanning both lines, a label, a description and a floating badge."
      >
        <div className="grid max-w-96 gap-3">
          <Control
            $layer
            $border
            $rounded="xl"
            $p={3}
            className="relative justify-start"
          >
            <ControlSlot $kind="avatar" $layer="brand" $size="lg" $rowSpan={2}>
              DH
            </ControlSlot>
            <ControlContent>
              <ControlLabel>Diego Haz</ControlLabel>
              <ControlDescription>
                Label, description and avatar slot
              </ControlDescription>
            </ControlContent>
            <ControlSlot $kind="badge" $layer="success" $floating>
              Pro
            </ControlSlot>
          </Control>
          <Control
            $layer
            $border
            $rounded="xl"
            $p={3}
            className="justify-start"
          >
            <ControlSlot>
              <icons.Bell />
            </ControlSlot>
            <ControlContent>
              <ControlLabel>Notifications</ControlLabel>
              <ControlDescription>
                Icon slot, then a shortcut slot
              </ControlDescription>
            </ControlContent>
            <ControlSlot $kind="shortcut">⌘N</ControlSlot>
          </Control>
        </div>
      </Sample>

      <Sample
        title="Slot kinds"
        code='ControlSlot $kind="icon" | "avatar" | "badge" | "shortcut"'
        description="Icons and shortcuts are transparent. Avatars and badges paint a surface, so they bump to a padded size."
      >
        <Stage>
          <Control $layer $border>
            <ControlSlot>
              <icons.Mail />
            </ControlSlot>
            Icon
          </Control>
          <Control $layer $border>
            <ControlSlot $kind="avatar" $layer="secondary">
              AK
            </ControlSlot>
            Avatar
          </Control>
          <Control $layer $border>
            Badge
            <ControlSlot $kind="badge">42</ControlSlot>
          </Control>
          <Control $layer $border>
            Brand badge
            <ControlSlot $kind="badge" $layer="brand">
              New
            </ControlSlot>
          </Control>
          <Control $layer $border>
            Shortcut
            <ControlSlot $kind="shortcut">⌘K</ControlSlot>
          </Control>
        </Stage>
      </Sample>

      <Sample
        title="Slot sizes and margins"
        code='ControlSlot $size · $mx="closeGap" · $p="xl" · $square={false} · $rounded="full"'
        description="Each size sets its own side margin so the slot sits optically beside the text. Close gap pulls it in, and the padding and square knobs reshape it."
      >
        <Stage>
          {slotSizes.map((size) => (
            <Control key={size} $layer $border>
              <ControlSlot $size={size}>
                <icons.Star />
              </ControlSlot>
              {size}
            </Control>
          ))}
        </Stage>
        <Stage>
          <Control $layer $border>
            <ControlSlot $mx="closeGap">
              <icons.Star />
            </ControlSlot>
            Close gap
          </Control>
          <Control $layer $border>
            <ControlSlot $mx="xl">
              <icons.Star />
            </ControlSlot>
            Wide margin
          </Control>
          <Control $layer $border>
            <ControlSlot $kind="badge" $p="xl">
              Padded badge
            </ControlSlot>
          </Control>
          <Control $layer $border>
            <ControlSlot $kind="avatar" $layer="brand" $rounded="md">
              AK
            </ControlSlot>
            Square avatar
          </Control>
          <Control $layer $border>
            <ControlSlot $square={false} $kind="badge" $layer="warning">
              Not square
            </ControlSlot>
          </Control>
        </Stage>
      </Sample>

      <Sample
        title="Sizes"
        code='Control $size="xs" | "sm" | "md" | "lg" | "xl"'
        description="Every measurement in the row derives from the font size, so one prop scales the whole control."
      >
        <Stage>
          {sizes.map((size) => (
            <Control key={size} $layer $border $size={size}>
              <ControlSlot>
                <icons.Sparkles />
              </ControlSlot>
              Size {size}
              <ControlSlot $kind="badge">9</ControlSlot>
            </Control>
          ))}
        </Stage>
      </Sample>

      <Sample
        title="Gap and padding"
        code='$gap="none" | "sm" | "md" | "lg" | "xl" · $px="sm" | "md" | "lg" | "xl" · $gapY'
        description="The gap between a slot and its text, and the horizontal padding added on top of the frame padding."
      >
        <Stage>
          {gaps.map((gap) => (
            <Control key={gap} $layer $border $gap={gap}>
              <ControlSlot>
                <icons.Tag />
              </ControlSlot>
              gap {gap}
            </Control>
          ))}
        </Stage>
        <Stage>
          {paddings.map((padding) => (
            <Control key={padding} $layer $border $rounded="full" $px={padding}>
              px {padding}
            </Control>
          ))}
          <Control $layer $border $p="none">
            No padding
          </Control>
        </Stage>
      </Sample>

      <Sample
        title="Content orientation and truncation"
        code='ControlContent $orientation="vertical" | "horizontal" · ControlLabel $truncate · ControlDescription $lineClamp'
        description="Vertical content stacks the label over the description. Horizontal content lets them wrap on one line."
      >
        <div className="grid max-w-80 gap-3">
          <Control
            $layer
            $border
            $rounded="xl"
            $p={3}
            className="justify-start"
          >
            <ControlContent>
              <ControlLabel $truncate>
                A label long enough to truncate inside a narrow control row
              </ControlLabel>
              <ControlDescription $truncate>
                A description that truncates on its own line as well
              </ControlDescription>
            </ControlContent>
          </Control>
          <Control
            $layer
            $border
            $rounded="xl"
            $p={3}
            className="justify-start"
          >
            <ControlContent>
              <ControlLabel>Clamped to two lines</ControlLabel>
              <ControlDescription $lineClamp={2}>
                Ariakit components are unstyled by default. The styling layer
                composes reusable recipes with local utility overrides, so a
                button and a tab share one set of controls.
              </ControlDescription>
            </ControlContent>
          </Control>
          <Control
            $layer
            $border
            $rounded="xl"
            $p={3}
            className="justify-start"
          >
            <ControlContent $orientation="horizontal">
              <ControlLabel>Horizontal</ControlLabel>
              <ControlDescription>flows beside the label</ControlDescription>
            </ControlContent>
          </Control>
        </div>
      </Sample>

      <Sample
        title="Disabled"
        code='$disabled · aria-disabled="true"'
        description="The disabled channel reaches every part: the border drops, the ink greys and painted slots darken."
      >
        <Stage>
          <Control $layer $border $disabled className="justify-start">
            <ControlSlot>
              <icons.Lock />
            </ControlSlot>
            <ControlContent>
              <ControlLabel>Disabled control</ControlLabel>
              <ControlDescription>Every part follows</ControlDescription>
            </ControlContent>
            <ControlSlot $kind="badge" $layer="brand">
              Pro
            </ControlSlot>
          </Control>
          <Control $layer $border aria-disabled="true">
            <ControlSlot $kind="avatar" $layer="secondary">
              AK
            </ControlSlot>
            Aria disabled
          </Control>
        </Stage>
      </Sample>

      <Sample
        title="Groups"
        code='ControlGroup $layout · $gap · $size · $p="none"'
        description="The group sizes its controls together and joins them when it has no padding of its own."
      >
        <Stage direction="column">
          <ControlGroup $border $layer className="w-max max-w-full">
            <Control>One</Control>
            <Control>Two</Control>
            <Control>Three</Control>
          </ControlGroup>
          <ControlGroup $border $layer $p="none" className="w-max max-w-full">
            <Control>Joined</Control>
            <Control>Controls</Control>
          </ControlGroup>
          <ControlGroup $border $layer $layout="stretch" $gap="none">
            <Control>Start</Control>
            <ControlSeparator $kind="chevron" />
            <Control>Review</Control>
            <ControlSeparator $kind="chevron" />
            <Control>Ship</Control>
          </ControlGroup>
          <ControlGroup
            $border
            $layer
            $size="sm"
            $gap="sm"
            className="w-max max-w-full"
          >
            <Control>Small</Control>
            <Control>Gapped</Control>
            <Control>Group</Control>
          </ControlGroup>
          <ControlGroup $border $layer $layout="vertical" className="w-max">
            <Control>Vertical</Control>
            <ControlSeparator />
            <Control>Hides its separators</Control>
          </ControlGroup>
        </Stage>
      </Sample>

      <Sample
        title="Separators"
        code='ControlSeparator $kind="pipe" | "slash" | "chevron" · $size · $width'
        description="A thicker rule reads heavier, so its alpha falls as the width grows. Chevrons start higher and fall faster."
      >
        <Stage direction="column">
          {separatorKinds.map((kind) => (
            <ControlGroup
              key={kind}
              $border
              $layer
              $p="none"
              className="w-max max-w-full"
            >
              <Control>One</Control>
              <ControlSeparator $kind={kind} />
              <Control>Two</Control>
              <ControlSeparator $kind={kind} $width={2} />
              <Control>Three</Control>
              <ControlSeparator $kind={kind} $width={3} />
              <Control>{kind}</Control>
            </ControlGroup>
          ))}
          <ControlGroup $border $layer className="w-max max-w-full">
            {separatorSizes.map((size, index) => (
              <React.Fragment key={size}>
                {index > 0 && <ControlSeparator $size={size} $shy={false} />}
                <Control>{size}</Control>
              </React.Fragment>
            ))}
          </ControlGroup>
        </Stage>
      </Sample>

      <Sample
        title="Layers"
        code='Control $layer="brand" | "danger" | "ghost" · $invert'
        description="A control takes every layer color, and its slots read the same layer for their surfaces."
      >
        <Stage>
          {(
            ["brand", "secondary", "success", "warning", "danger"] as const
          ).map((layer) => (
            <Control key={layer} $layer={layer} $border>
              <ControlSlot>
                <icons.Circle />
              </ControlSlot>
              {layer}
              <ControlSlot $kind="badge">1</ControlSlot>
            </Control>
          ))}
          <Control $invert>
            <ControlSlot>
              <icons.Circle />
            </ControlSlot>
            inverted
          </Control>
          <Labeled label="Ghost">
            <Control $layer="ghost" $border>
              ghost
            </Control>
          </Labeled>
        </Stage>
      </Sample>
    </Samples>
  );
}
