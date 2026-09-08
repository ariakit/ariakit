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
  Badge,
  BadgeLabel,
  BadgeSlot,
} from "@ariakit/ui/components/badge.ariakit.react.tsx";
import {
  Button,
  ButtonSlot,
  ButtonLabel,
} from "@ariakit/ui/components/button.ariakit.react.tsx";
import { Heading } from "@ariakit/ui/components/heading.ariakit.react.tsx";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react.tsx";
import * as icons from "lucide-react";
import {
  Caption,
  Sample,
  Samples,
  Stage,
  SwatchGrid,
} from "./gallery.react.tsx";

const colors = ["brand", "secondary", "success", "warning", "danger"] as const;
const sizes = ["xs", "sm", "md", "lg"] as const;
const radii = ["full", "xl", "lg", "md", "sm"] as const;
const borderTypes = ["inset", "border", "ring", "dashed", "dotted"] as const;

function Dot() {
  return <span className="size-[0.5em] rounded-full bg-current" />;
}

export function BadgeSection() {
  return (
    <Samples>
      <Sample
        title="Layers"
        code='$layer="brand" | "success" | "var(--color-green-500)" | "transparent"'
        description="A plain badge lifts off its surface. A colored badge tints toward its color, keeps a tinted ring and saturates its text."
      >
        <Stage>
          <Badge>
            <BadgeLabel>Default</BadgeLabel>
          </Badge>
          {colors.map((color) => (
            <Badge key={color} $layer={color}>
              <BadgeLabel>{color}</BadgeLabel>
            </Badge>
          ))}
          <Badge $layer="var(--color-green-500)">
            <BadgeLabel>Green 500</BadgeLabel>
          </Badge>
          <Badge $layer="#635bff">
            <BadgeLabel>Custom</BadgeLabel>
          </Badge>
          <Badge $layer="transparent">
            <BadgeLabel>Transparent</BadgeLabel>
          </Badge>
          <Badge $invert>
            <BadgeLabel>Inverted</BadgeLabel>
          </Badge>
        </Stage>
      </Sample>

      <Sample
        title="Sizes"
        code='$size="xs" | "sm" | "md" | "lg" | "auto"'
        description="The default is xs. Auto inherits the surrounding font size, so a badge in a heading grows with it."
      >
        <Stage>
          {sizes.map((size) => (
            <Badge key={size} $layer="brand" $size={size}>
              <BadgeLabel>{size}</BadgeLabel>
            </Badge>
          ))}
        </Stage>
        <Heading $level={3} className="mt-0 mb-0 flex items-center gap-3">
          Heading
          <Badge $layer="brand" $size="auto">
            <BadgeLabel>auto</BadgeLabel>
          </Badge>
          <Badge $layer="success">
            <BadgeLabel>xs</BadgeLabel>
          </Badge>
        </Heading>
      </Sample>

      <Sample
        title="Radius and padding"
        code='$rounded="full" | "xl" | "lg" | "md" | "sm" · $p={2} · $px'
        description="A pill by default. Smaller radii read as tags, and more padding as a chip."
      >
        <Stage>
          {radii.map((radius) => (
            <Badge key={radius} $layer="brand" $rounded={radius}>
              <BadgeLabel>{radius}</BadgeLabel>
            </Badge>
          ))}
        </Stage>
        <Stage>
          <Badge $layer="brand" $p={2}>
            <BadgeLabel>$p={2}</BadgeLabel>
          </Badge>
          <Badge $layer="brand" $rounded="lg" $p={2} $px="sm">
            <BadgeLabel>$px="sm"</BadgeLabel>
          </Badge>
          <Badge $layer="brand" $p={0.5} $px="xl">
            <BadgeLabel>$p={0.5} $px="xl"</BadgeLabel>
          </Badge>
        </Stage>
      </Sample>

      <Sample
        title="Borders and edges"
        code='$borderType="inset" | "border" | "ring" | "dashed" | "dotted" · $edgeWeight · $border={2}'
        description="The default ring is inset. A dashed brand badge is the Plus marker used across the app."
      >
        <Stage>
          {borderTypes.map((type) => (
            <Badge key={type} $layer="brand" $rounded="lg" $borderType={type}>
              <BadgeLabel>{type}</BadgeLabel>
            </Badge>
          ))}
        </Stage>
        <Stage>
          <Badge
            $layer="brand"
            $size="sm"
            $rounded="lg"
            $p={2}
            $borderType="dashed"
            $edgeWeight="medium"
          >
            <BadgeLabel>Plus</BadgeLabel>
          </Badge>
          <Badge $layer="danger" $edgeWeight="bold">
            <BadgeLabel>Bold edge</BadgeLabel>
          </Badge>
          <Badge $edgeWeight="normal">
            <BadgeLabel>Visible plain edge</BadgeLabel>
          </Badge>
          <Badge $layer="success" $border={2}>
            <BadgeLabel>2px</BadgeLabel>
          </Badge>
          <Badge $layer="warning" $border={false}>
            <BadgeLabel>No edge</BadgeLabel>
          </Badge>
        </Stage>
      </Sample>

      <Sample
        title="Slots"
        code="BadgeSlot before or after BadgeLabel"
        description="An icon, a status dot or an avatar in the leading slot, and a count in the trailing one."
      >
        <Stage>
          <Badge $layer="success">
            <BadgeSlot>
              <icons.Check />
            </BadgeSlot>
            <BadgeLabel>Purchased</BadgeLabel>
          </Badge>
          <Badge $layer="warning">
            <BadgeSlot>
              <Dot />
            </BadgeSlot>
            <BadgeLabel>Pending</BadgeLabel>
          </Badge>
          <Badge $layer="danger">
            <BadgeSlot>
              <icons.AlertTriangle />
            </BadgeSlot>
            <BadgeLabel>Failed</BadgeLabel>
          </Badge>
          <Badge>
            <BadgeSlot $kind="avatar" $layer="brand">
              DH
            </BadgeSlot>
            <BadgeLabel>Assignee</BadgeLabel>
          </Badge>
          <Badge $layer="brand">
            <BadgeLabel>Updates</BadgeLabel>
            <BadgeSlot className="rtl:-scale-x-100">
              <icons.ArrowRight />
            </BadgeSlot>
          </Badge>
          <Badge $size="sm">
            <BadgeLabel>Issues</BadgeLabel>
            <BadgeSlot $kind="badge" $layer="danger">
              12
            </BadgeSlot>
          </Badge>
        </Stage>
      </Sample>

      <Sample
        title="Color modifiers"
        code='$mix={0 | 15 | 40} · $chroma="neon" · $textChroma · $lightnessOffset'
        description="The tint is a 15% mix by default. Zero paints the color solid and the text adjusts to stay readable."
      >
        <Stage>
          <Badge $layer="brand" $mix={0}>
            <BadgeLabel>Solid</BadgeLabel>
          </Badge>
          <Badge $layer="brand">
            <BadgeLabel>Mix 15</BadgeLabel>
          </Badge>
          <Badge $layer="brand" $mix={40}>
            <BadgeLabel>Mix 40</BadgeLabel>
          </Badge>
          <Badge $layer="brand" $chroma="neon">
            <BadgeLabel>Neon</BadgeLabel>
          </Badge>
          <Badge $layer="brand" $textChroma="muted">
            <BadgeLabel>Muted text</BadgeLabel>
          </Badge>
          <Badge $lightnessOffset={4}>
            <BadgeLabel>Offset 4</BadgeLabel>
          </Badge>
          <Badge $layer="brand" $hue="green">
            <BadgeLabel>Hue green</BadgeLabel>
          </Badge>
        </Stage>
      </Sample>

      <Sample
        title="In context"
        code="Badge beside text · ButtonSlot $kind=badge inside Button"
        description="A standalone badge next to a button's own badge slot, which shares the same recipe."
      >
        <Stage>
          <span className="inline-flex items-center gap-2 text-sm">
            Release notes
            <Badge $layer="brand">
              <BadgeLabel>v0.2</BadgeLabel>
            </Badge>
          </span>
          <Button>
            <ButtonLabel>Inbox</ButtonLabel>
            <ButtonSlot $kind="badge" $layer="brand">
              v0.2
            </ButtonSlot>
          </Button>
          <Button $kind="bevel">
            <ButtonSlot>
              <icons.Bell />
            </ButtonSlot>
            <ButtonLabel>Alerts</ButtonLabel>
            <ButtonSlot $kind="badge" $layer="danger">
              3
            </ButtonSlot>
          </Button>
        </Stage>
      </Sample>

      <Sample
        title="On layers"
        code="Badge inside Layer"
        description="Plain and colored badges on offset, inverted and colored surfaces."
      >
        <SwatchGrid min="11rem">
          {(
            [
              { label: "Offset", props: { $lightnessOffset: 2 } },
              { label: "Inverted", props: { $invert: true } },
              { label: "Brand", props: { $layer: "brand" } },
              { label: "Success", props: { $layer: "success" } },
            ] as const
          ).map(({ label, props }) => (
            <Layer key={label} {...props} className="grid gap-2 rounded-xl p-4">
              <Caption>{label}</Caption>
              <Stage className="gap-2">
                <Badge>
                  <BadgeLabel>Plain</BadgeLabel>
                </Badge>
                <Badge $layer="brand">
                  <BadgeLabel>Brand</BadgeLabel>
                </Badge>
                <Badge $layer="danger">
                  <BadgeLabel>Danger</BadgeLabel>
                </Badge>
              </Stage>
            </Layer>
          ))}
        </SwatchGrid>
      </Sample>
    </Samples>
  );
}
