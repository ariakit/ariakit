/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { ButtonProps } from "@ariakit/ui/components/button.ariakit.react.tsx";
import {
  Button,
  ButtonContent,
  ButtonDescription,
  ButtonGlider,
  ButtonGroup,
  ButtonLabel,
  ButtonSeparator,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react.tsx";
import { Kbd } from "@ariakit/ui/components/kbd.ariakit.react.tsx";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react.tsx";
import * as icons from "lucide-react";
import * as React from "react";
import {
  Caption,
  Labeled,
  Sample,
  Samples,
  Stage,
  SwatchGrid,
} from "./gallery.react.tsx";

const layers = [
  { label: "Default", props: {} },
  { label: "Brand", props: { $layer: "brand" } },
  { label: "Secondary", props: { $layer: "secondary" } },
  { label: "Success", props: { $layer: "success" } },
  { label: "Warning", props: { $layer: "warning" } },
  { label: "Danger", props: { $layer: "danger" } },
  { label: "Custom", props: { $layer: "#635bff" } },
  { label: "Inverted", props: { $invert: true } },
  { label: "Ghost", props: { $layer: "ghost" } },
] satisfies readonly { label: string; props: ButtonProps }[];

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
const radii = ["md", "lg", "xl", "full"] as const;
const separatorKinds = ["pipe", "slash", "chevron"] as const;
const separatorSizes = ["xs", "sm", "md", "lg", "full"] as const;

function KindRow({ kind }: { kind: "flat" | "bevel" }) {
  return (
    <Stage>
      {layers.map(({ label, props }) => (
        <Button key={label} $kind={kind} {...props}>
          {label}
        </Button>
      ))}
    </Stage>
  );
}

function SelectableGroup({
  children,
}: {
  children: (
    selected: number,
    select: (index: number) => void,
  ) => React.ReactNode;
}) {
  const [selected, setSelected] = React.useState(0);
  return children(selected, setSelected);
}

export function ButtonSection() {
  return (
    <Samples>
      <Sample
        wide
        title="Kinds and layers"
        code='$kind="flat" | "bevel" · $layer · $invert'
        description="A flat button paints its layer and lifts on hover. A bevel raises it with a gradient and an inner shadow. Both take every layer color."
      >
        <Labeled label="Flat">
          <KindRow kind="flat" />
        </Labeled>
        <Labeled label="Bevel">
          <KindRow kind="bevel" />
        </Labeled>
      </Sample>

      <Sample
        title="Sizes"
        code='$size="xs" | "sm" | "md" | "lg" | "xl"'
        description="The font size drives the padding, the gap and the slot size with it."
      >
        <Stage>
          {sizes.map((size) => (
            <Button key={size} $size={size}>
              <ButtonSlot>
                <icons.Sparkles />
              </ButtonSlot>
              <ButtonLabel>Size {size}</ButtonLabel>
            </Button>
          ))}
        </Stage>
        <Stage>
          {sizes.map((size) => (
            <Button key={size} $kind="bevel" $size={size}>
              Bevel {size}
            </Button>
          ))}
        </Stage>
      </Sample>

      <Sample
        title="Radius and padding"
        code='$rounded · $p · $px="sm" | "md" | "lg" | "xl"'
        description="A pill usually wants more horizontal padding, which px adds on top of the frame padding."
      >
        <Stage>
          {radii.map((radius) => (
            <Button key={radius} $rounded={radius}>
              {radius}
            </Button>
          ))}
        </Stage>
        <Stage>
          <Button $p={1}>$p={1}</Button>
          <Button $p={2}>$p={2}</Button>
          <Button $p={3}>$p={3}</Button>
          <Button $p={4}>$p={4}</Button>
          <Button $p="none">$p="none"</Button>
        </Stage>
        <Stage>
          <Button $rounded="full" $px="sm">
            px sm
          </Button>
          <Button $rounded="full" $px="md">
            px md
          </Button>
          <Button $rounded="full" $px="lg">
            px lg
          </Button>
          <Button $rounded="full" $px="xl">
            px xl
          </Button>
        </Stage>
      </Sample>

      <Sample
        title="Disabled"
        code='disabled · aria-disabled="true" · $disabled'
        description="The native attribute, the aria attribute and the variant all paint the same state and drop the hover and press feedback."
      >
        <Stage>
          <Button disabled>Native</Button>
          <Button aria-disabled="true">Aria</Button>
          <Button $disabled>Variant</Button>
          <Button $kind="bevel" disabled>
            Bevel
          </Button>
          <Button $layer="brand" disabled>
            Brand
          </Button>
          <Button $layer="danger" $kind="bevel" disabled>
            Danger bevel
          </Button>
          <Button disabled>
            <ButtonSlot>
              <icons.Trash2 />
            </ButtonSlot>
            <ButtonLabel>With slot</ButtonLabel>
            <ButtonSlot $kind="badge">3</ButtonSlot>
          </Button>
        </Stage>
      </Sample>

      <Sample
        title="Slots"
        code='ButtonSlot $kind="icon" | "avatar" | "badge" | "shortcut"'
        description="A slot sizes itself from the button's font and sits optically beside the text. Badges and avatars paint their own surface."
      >
        <Stage>
          <Button>
            <ButtonSlot>
              <icons.Download />
            </ButtonSlot>
            Download
          </Button>
          <Button>
            Next
            <ButtonSlot>
              <icons.ArrowRight />
            </ButtonSlot>
          </Button>
          <Button>
            <ButtonSlot $kind="avatar" $layer="brand">
              DH
            </ButtonSlot>
            Diego Haz
          </Button>
          <Button>
            <ButtonSlot $kind="avatar">
              <img
                alt=""
                src="https://api.dicebear.com/9.x/shapes/svg?seed=ariakit"
              />
            </ButtonSlot>
            Avatar image
          </Button>
          <Button>
            Inbox
            <ButtonSlot $kind="badge">12</ButtonSlot>
          </Button>
          <Button>
            Alerts
            <ButtonSlot $kind="badge" $layer="danger">
              3
            </ButtonSlot>
          </Button>
          <Button>
            Search
            <ButtonSlot $kind="shortcut">⌘K</ButtonSlot>
          </Button>
          <Button>
            Save
            <ButtonSlot $kind="shortcut">
              <Kbd>⌘</Kbd>
              <Kbd>S</Kbd>
            </ButtonSlot>
          </Button>
          <Button className="relative">
            Floating badge
            <ButtonSlot $kind="badge" $layer="success" $floating>
              New
            </ButtonSlot>
          </Button>
        </Stage>
      </Sample>

      <Sample
        title="Slot sizes"
        code='ButtonSlot $size="xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"'
        description="Icon slots step from an x-height to a full line, and beyond it into the padding."
      >
        <Stage>
          {(["xs", "sm", "md", "lg", "xl", "2xl", "full"] as const).map(
            (size) => (
              <Button key={size}>
                <ButtonSlot $size={size}>
                  <icons.Star />
                </ButtonSlot>
                {size}
              </Button>
            ),
          )}
        </Stage>
        <Stage>
          {(["sm", "md", "lg", "xl", "2xl", "full"] as const).map((size) => (
            <Button key={size}>
              <ButtonSlot $kind="avatar" $layer="secondary" $size={size}>
                AK
              </ButtonSlot>
              {size}
            </Button>
          ))}
        </Stage>
      </Sample>

      <Sample
        title="Content, label and description"
        code="ButtonContent > ButtonLabel + ButtonDescription · $rowSpan · $lineClamp"
        description="The content stacks a label over a description and truncates both. An avatar spans the two rows."
      >
        <div className="grid max-w-96 gap-3 *:min-w-0 *:max-w-full">
          <Button $rounded="xl" $p={3} className="justify-start text-start">
            <ButtonSlot
              $kind="avatar"
              $layer="secondary"
              $size="lg"
              $rowSpan={2}
            >
              UI
            </ButtonSlot>
            <ButtonContent>
              <ButtonLabel>Open Ariakit UI</ButtonLabel>
              <ButtonDescription>
                A secondary line that truncates when the row runs out of room
              </ButtonDescription>
            </ButtonContent>
            <ButtonSlot $kind="shortcut">↵</ButtonSlot>
          </Button>
          <Button $rounded="xl" $p={3} className="justify-start text-start">
            <ButtonSlot>
              <icons.FolderOpen />
            </ButtonSlot>
            <ButtonContent>
              <ButtonLabel>Clamped description</ButtonLabel>
              <ButtonDescription $truncate={false} $lineClamp={2}>
                Two lines of description before the clamp cuts it. Ariakit
                components are unstyled by default, and the styling layer
                composes reusable recipes with local utility overrides.
              </ButtonDescription>
            </ButtonContent>
          </Button>
          <Button $rounded="xl" $p={3} className="justify-start text-start">
            <ButtonContent $orientation="horizontal">
              <ButtonLabel>Horizontal content</ButtonLabel>
              <ButtonDescription $truncate={false}>
                wraps beside the label
              </ButtonDescription>
            </ButtonContent>
          </Button>
        </div>
      </Sample>

      <Sample
        title="Icon only and as a link"
        code='aria-label · $rounded="full" · render={<a href />} · type="submit"'
        description="A lone slot makes a square button. A link keeps the button look and the pointer cursor, which a command button never shows."
      >
        <Stage>
          <Button aria-label="Settings">
            <ButtonSlot>
              <icons.Settings />
            </ButtonSlot>
          </Button>
          <Button aria-label="Add" $rounded="full" $kind="bevel">
            <ButtonSlot>
              <icons.Plus />
            </ButtonSlot>
          </Button>
          <Button aria-label="Close" $layer="ghost" $size="sm">
            <ButtonSlot>
              <icons.X />
            </ButtonSlot>
          </Button>
          <Button
            aria-label="Favorite"
            $layer="danger"
            $rounded="full"
            $size="lg"
          >
            <ButtonSlot>
              <icons.Heart />
            </ButtonSlot>
          </Button>
          <Button render={<a href="#button" />}>
            Anchor button
            <ButtonSlot>
              <icons.ArrowUpRight />
            </ButtonSlot>
          </Button>
          <Button type="submit" $layer="brand" $kind="bevel">
            Submit
          </Button>
        </Stage>
      </Sample>

      <Sample
        title="States"
        code="$hoverOffset · $hoverPush · $activeDepth · $active · $focus · $focusHighlight"
        description="Hover, press and tab through these to compare the feedback each knob produces."
      >
        <Stage>
          <Button>Default</Button>
          <Button $hoverOffset={false}>No hover</Button>
          <Button $hoverPush={3}>Hover push 3</Button>
          <Button $hoverLighten={4}>Hover lighten</Button>
          <Button $hoverSaturate={20} $layer="brand">
            Hover saturate
          </Button>
          <Button $activeDepth={1}>Shallow press</Button>
          <Button $activeDepth={10}>Deep press</Button>
          <Button $active={false}>No press</Button>
          <Button $focus={3} $focusOffset={2}>
            Thick ring
          </Button>
          <Button $focus={false}>No ring</Button>
          <Button $focusHighlight>Highlight</Button>
        </Stage>
      </Sample>

      <Sample
        title="Groups"
        code='ButtonGroup $layout="horizontal" | "stretch" | "vertical" | "wrap" · $gap · $p="none"'
        description="A group sizes its buttons together. Without padding the inner corners square off so the buttons join."
      >
        <Stage direction="column">
          <ButtonGroup $border $layer className="w-max max-w-full">
            <Button>Day</Button>
            <Button>Week</Button>
            <Button>Month</Button>
          </ButtonGroup>
          <ButtonGroup $border $layer $p="none" className="w-max max-w-full">
            <Button>Joined</Button>
            <Button>Buttons</Button>
            <Button>No padding</Button>
          </ButtonGroup>
          <ButtonGroup $border $layer $layout="stretch">
            <Button>Stretch</Button>
            <Button>Fills</Button>
            <Button>The row</Button>
          </ButtonGroup>
          <ButtonGroup $border $layer $gap="md" $size="sm">
            <Button>Gap md</Button>
            <Button>Size sm</Button>
            <Button>Bordered</Button>
          </ButtonGroup>
          <ButtonGroup $layout="wrap" $gap="sm">
            <Button>Wrap</Button>
            <Button>With</Button>
            <Button>A gap</Button>
            <Button>And no border</Button>
            <Button>Of its own</Button>
          </ButtonGroup>
          <ButtonGroup $border $layer $layout="vertical" className="w-max">
            <Button>Vertical</Button>
            <Button>Left aligned</Button>
            <Button>Rows</Button>
          </ButtonGroup>
        </Stage>
      </Sample>

      <Sample
        title="Separators"
        code='ButtonSeparator $kind="pipe" | "slash" | "chevron" · $size · $width · $shy'
        description="Shy separators fade next to a hovered, selected or focused button. Hover the rows to compare."
      >
        <Stage direction="column">
          {separatorKinds.map((kind) => (
            <ButtonGroup key={kind} $border $layer className="w-max max-w-full">
              <Button>One</Button>
              <ButtonSeparator $kind={kind} />
              <Button>Two</Button>
              <ButtonSeparator $kind={kind} />
              <Button>{kind}</Button>
            </ButtonGroup>
          ))}
          <ButtonGroup $border $layer className="w-max max-w-full">
            {separatorSizes.map((size, index) => (
              <React.Fragment key={size}>
                {index > 0 && <ButtonSeparator $size={size} />}
                <Button>{size}</Button>
              </React.Fragment>
            ))}
          </ButtonGroup>
          <ButtonGroup $border $layer className="w-max max-w-full">
            <Button>Width 1</Button>
            <ButtonSeparator $width={1} $shy={false} />
            <Button>Width 2</Button>
            <ButtonSeparator $width={2} $shy={false} />
            <Button>Width 3</Button>
            <ButtonSeparator $width={3} $shy={false} />
            <Button>Not shy</Button>
          </ButtonGroup>
        </Stage>
      </Sample>

      <Sample
        title="With a glider"
        code='ButtonGroup > Button aria-selected + ButtonGlider $kind="bevel" $state="selected"'
        description="The glider anchors to the selected button and travels when the selection moves. Click to move it."
      >
        <SelectableGroup>
          {(selected, select) => (
            <Stage direction="column">
              <ButtonGroup $border $layer className="w-max max-w-full">
                {["Back", "Forward", "Reload"].map((label, index) => (
                  <Button
                    key={label}
                    aria-selected={selected === index}
                    onClick={() => select(index)}
                  >
                    {label}
                  </Button>
                ))}
                <ButtonGlider $kind="bevel" $state="selected" />
              </ButtonGroup>
              <ButtonGroup $border $layer className="w-max max-w-full">
                {["Back", "Forward", "Reload"].map((label, index) => (
                  <React.Fragment key={label}>
                    {index > 0 && <ButtonSeparator $kind="slash" />}
                    <Button
                      aria-selected={selected === index}
                      onClick={() => select(index)}
                    >
                      {label}
                    </Button>
                  </React.Fragment>
                ))}
                <ButtonGlider $kind="flat" $state="selected" />
                <ButtonGlider $kind="flat" $state="hover" />
              </ButtonGroup>
            </Stage>
          )}
        </SelectableGroup>
      </Sample>

      <Sample
        title="On layers"
        code="Button inside Layer"
        description="Flat and bevel buttons on an offset, an inverted and a brand surface."
      >
        <SwatchGrid min="12rem">
          {(
            [
              { label: "Offset", props: { $lightnessOffset: 2 } },
              { label: "Inverted", props: { $invert: true } },
              { label: "Brand", props: { $layer: "brand" } },
              { label: "Near black", props: { $layer: "#111827" } },
            ] as const
          ).map(({ label, props }) => (
            <Layer key={label} {...props} className="grid gap-2 rounded-xl p-4">
              <Caption>{label}</Caption>
              <Stage>
                <Button>Flat</Button>
                <Button $kind="bevel">Bevel</Button>
                <Button $layer="brand">Brand</Button>
                <Button disabled>Off</Button>
              </Stage>
            </Layer>
          ))}
        </SwatchGrid>
      </Sample>
    </Samples>
  );
}
