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
} from "@ariakit/ui/components/badge.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Heading } from "@ariakit/ui/components/heading.ariakit.react";
import { Text } from "@ariakit/ui/components/text.ariakit.react";
import { ArrowRight, Check } from "lucide-react";
import { Example, ExampleGrid } from "../example.react.tsx";
import { createGalleryPage } from "../shell.react.tsx";

export function BadgeExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="A small pill that lifts off the surface under it. Its hairline shows only in high-contrast mode."
      >
        <Badge>
          <BadgeLabel>Draft</BadgeLabel>
        </Badge>
      </Example>

      <Example
        title="Brand"
        description="A colored badge tints toward its color, with a ring and text of the same hue."
      >
        <Badge $layer="brand">
          <BadgeLabel>Beta</BadgeLabel>
        </Badge>
      </Example>

      <Example
        title="Custom color"
        description="Any CSS color sets the tint, the ring and the text through the same path as a named color."
      >
        <Badge $layer="#635bff">
          <BadgeLabel>Enterprise</BadgeLabel>
        </Badge>
      </Example>

      <Example
        title="Solid"
        description="Without the mix, the badge paints its color at full strength, and the text changes to stay readable."
      >
        <Badge $layer="brand" $mix={0}>
          <BadgeLabel>New</BadgeLabel>
        </Badge>
      </Example>

      <Example
        title="Inverted"
        description="A neutral badge with high contrast: dark on a light surface, and light on a dark one."
      >
        <Badge $invert>
          <BadgeLabel>Archived</BadgeLabel>
        </Badge>
      </Example>

      <Example
        title="Outline"
        description="A see-through badge with a neutral ring that shows on every surface."
      >
        <Badge $layer="transparent" $edgeWeight="normal">
          <BadgeLabel>Optional</BadgeLabel>
        </Badge>
      </Example>

      <Example
        title="Flat tint"
        description="The tint alone separates the badge. No ring shows, also inside a bordered frame such as this box."
      >
        <Badge $layer="warning" $border={false}>
          <BadgeLabel>Needs review</BadgeLabel>
        </Badge>
      </Example>

      <Example
        title="Strong ring"
        description="A wider, heavier ring for a badge that must stand out."
      >
        <Badge $layer="danger" $border={2} $edgeWeight="bold">
          <BadgeLabel>Blocked</BadgeLabel>
        </Badge>
      </Example>

      <Example
        title="Raw ring"
        description="The ring paints the exact color of the badge, at full strength."
      >
        <Badge $layer="brand" $edgeRaw>
          <BadgeLabel>Verified</BadgeLabel>
        </Badge>
      </Example>

      <Example
        title="Dashed border"
        description="A dashed border instead of the ring. A border adds to the size of the badge, and a ring does not."
      >
        <Badge $layer="brand" $borderType="dashed">
          <BadgeLabel>Plus</BadgeLabel>
        </Badge>
      </Example>

      <Example
        title="Hue"
        description="A hue changes the tint, the ring and the text together."
      >
        <Badge $layer="brand" $hue="green">
          <BadgeLabel>Approved</BadgeLabel>
        </Badge>
      </Example>

      <Example
        title="Tag shape"
        description="A smaller radius makes the badge read as a tag."
      >
        <Badge $layer="secondary" $rounded="md">
          <BadgeLabel>v2.4.0</BadgeLabel>
        </Badge>
      </Example>

      <Example
        title="Large"
        description="A larger font scales the padding, the radius and the slots with it."
      >
        <Badge $layer="brand" $size="lg">
          <BadgeLabel>Pro</BadgeLabel>
        </Badge>
      </Example>

      <Example
        title="In running text"
        description="The badge sits on the line of the text around it and keeps its own width."
      >
        <p>
          Release notes{" "}
          <Badge $layer="brand">
            <BadgeLabel>v0.2</BadgeLabel>
          </Badge>{" "}
          are out.
        </p>
      </Example>

      <Example
        title="Auto size in a heading"
        description="The badge takes its font size from the heading around it."
      >
        <Heading $level={3} className="mt-0 mb-0">
          Changelog{" "}
          <Badge $layer="brand" $size="auto">
            <BadgeLabel>Latest</BadgeLabel>
          </Badge>
        </Heading>
      </Example>

      <Example
        title="Leading icon"
        description="An icon before the label, sized from the badge font and painted with the text color."
      >
        <Badge $layer="success">
          <BadgeSlot>
            <Check />
          </BadgeSlot>
          <BadgeLabel>Purchased</BadgeLabel>
        </Badge>
      </Example>

      <Example
        title="Trailing icon"
        description="An icon after the label. The label moves its end margin to meet it."
      >
        <Badge $layer="brand">
          <BadgeLabel>Updates</BadgeLabel>
          <BadgeSlot className="rtl:-scale-x-100">
            <ArrowRight />
          </BadgeSlot>
        </Badge>
      </Example>

      <Example
        title="Avatar"
        description="A round avatar slot that paints its own surface behind an initial."
      >
        <Badge>
          <BadgeSlot $kind="avatar" $layer="brand">
            D
          </BadgeSlot>
          <BadgeLabel>Diego</BadgeLabel>
        </Badge>
      </Example>

      <Example
        title="Trailing count"
        description="A nested badge holds a count in a smaller font."
      >
        <Badge $size="sm">
          <BadgeLabel>Issues</BadgeLabel>
          <BadgeSlot $kind="badge" $layer="danger">
            12
          </BadgeSlot>
        </Badge>
      </Example>

      <Example
        title="Truncated label"
        description="A long label ends in an ellipsis when the badge has a maximum width."
      >
        <Badge className="max-w-28">
          <BadgeLabel $truncate>
            Waiting for review from the design team
          </BadgeLabel>
        </Badge>
      </Example>

      <Example
        title="On a brand layer"
        description="On a colored surface, a plain badge lifts off the surface and stays readable."
      >
        <Frame
          $layer="brand"
          $rounded="xl"
          $p={4}
          className="flex flex-wrap items-center gap-3"
        >
          <Text>New dashboard</Text>
          <Badge>
            <BadgeLabel>Beta</BadgeLabel>
          </Badge>
        </Frame>
      </Example>
    </ExampleGrid>
  );
}

export default createGalleryPage("badge", BadgeExamples);
