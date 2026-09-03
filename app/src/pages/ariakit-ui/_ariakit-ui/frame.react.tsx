/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Code } from "@ariakit/ui/components/code.ariakit.react.tsx";
import type { FrameProps } from "@ariakit/ui/components/frame.ariakit.react.tsx";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react.tsx";
import { Text } from "@ariakit/ui/components/text.ariakit.react.tsx";
import { clsx } from "clsx";
import type * as React from "react";
import { Caption, Sample, Samples, SwatchGrid } from "./gallery.react.tsx";

const roundedSteps = [
  "none",
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "full",
] as const;
const paddingSteps = ["none", 1, 2, 3, 4, 6, "1.5rem"] as const;
const borderTypes = [
  "auto",
  "border",
  "ring",
  "inset",
  "dashed",
  "dotted",
] as const;
const edgeColors = ["brand", "success", "warning", "danger"] as const;
const edgeWeights = [
  "adaptive",
  "light",
  "normal",
  "medium",
  "bold",
  60,
] as const;

interface FrameSwatchProps extends FrameProps {
  label: React.ReactNode;
  code?: React.ReactNode;
}

function FrameSwatch({ label, code, className, ...props }: FrameSwatchProps) {
  return (
    <Frame
      $p={3}
      $border
      className={clsx("grid min-h-24 min-w-0 content-between gap-2", className)}
      {...props}
    >
      <Text className="text-sm font-medium">{label}</Text>
      {code != null && (
        <Code className="w-fit max-w-full text-xs [overflow-wrap:anywhere]">
          {code}
        </Code>
      )}
    </Frame>
  );
}

export function FrameSection() {
  return (
    <Samples>
      <Sample
        wide
        title="Radius"
        code='$rounded="none" | "xs" | ... | "4xl" | "full" | "1.25rem"'
        description="A named step from the radius scale, or any length or expression."
      >
        <SwatchGrid min="7rem">
          {roundedSteps.map((step) => (
            <FrameSwatch key={step} label={step} $rounded={step} />
          ))}
          <FrameSwatch
            label="Length"
            code='$rounded="1.25rem"'
            $rounded="1.25rem"
          />
        </SwatchGrid>
      </Sample>

      <Sample
        title="Padding"
        code='$p="none" | 1 | 2 | 3 | 4 | 6 | "1.5rem"'
        description="Numbers scale the spacing token. The inner block shows where the content box starts."
      >
        <SwatchGrid min="6rem">
          {paddingSteps.map((step) => (
            <Frame key={step} $rounded="xl" $p={step} $border>
              <Frame
                $lightnessOffset
                className="grid min-h-14 place-items-center text-xs"
              >
                {String(step)}
              </Frame>
            </Frame>
          ))}
        </SwatchGrid>
      </Sample>

      <Sample
        title="Border types"
        code='$border $borderType="auto" | "border" | "ring" | "inset" | "dashed" | "dotted"'
        description="Auto picks a border or a ring from the parent lightness. A ring takes no layout space, and inset draws inside the box."
      >
        <SwatchGrid min="7rem">
          {borderTypes.map((type) => (
            <FrameSwatch
              key={type}
              label={type}
              $rounded="xl"
              $border={2}
              $borderType={type}
            />
          ))}
        </SwatchGrid>
      </Sample>

      <Sample
        title="Border width"
        code="$border | $border={2} | $border={4}"
        description="True is one pixel. A number is a width in pixels, and inherit takes the parent frame's border."
      >
        <SwatchGrid min="6rem">
          <FrameSwatch
            label="None"
            code="$border={false}"
            $rounded="xl"
            $border={false}
          />
          <FrameSwatch label="1" code="$border" $rounded="xl" />
          <FrameSwatch label="2" code="$border={2}" $rounded="xl" $border={2} />
          <FrameSwatch label="4" code="$border={4}" $rounded="xl" $border={4} />
        </SwatchGrid>
        <Frame
          $rounded="2xl"
          $p={3}
          $border={3}
          $edge="brand"
          className="grid gap-3"
        >
          <Caption>The children inherit a 3px brand border.</Caption>
          <SwatchGrid min="6rem">
            <FrameSwatch
              label="Inherit"
              code='$border="inherit"'
              $border="inherit"
            />
            <FrameSwatch label="Own" code="$border" />
          </SwatchGrid>
        </Frame>
      </Sample>

      <Sample
        title="Edge colors"
        code='$edge="brand" | "success" | "warning" | "danger" | "var(--color-green-500)" | $edgeRaw'
        description="Named edges tint the hairline, and any color value does the same. Raw applies the color exactly, without the alpha and lightness the edge normally adapts."
      >
        <SwatchGrid min="6rem">
          {edgeColors.map((color) => (
            <FrameSwatch
              key={color}
              label={color}
              $rounded="xl"
              $border={2}
              $edge={color}
            />
          ))}
          <FrameSwatch
            label="Green 500"
            code='$edge="var(--color-green-500)"'
            $rounded="xl"
            $border={2}
            $edge="var(--color-green-500)"
          />
          {edgeColors.map((color) => (
            <FrameSwatch
              key={`${color}-raw`}
              label={`${color} raw`}
              $rounded="xl"
              $border={2}
              $edge={color}
              $edgeRaw
            />
          ))}
        </SwatchGrid>
      </Sample>

      <Sample
        title="Edge weight"
        code='$edgeWeight="adaptive" | "light" | "normal" | "medium" | "bold" | 60'
        description="The hairline opacity. Adaptive edges appear only under high-contrast preferences."
      >
        <SwatchGrid min="6rem">
          {edgeWeights.map((weight) => (
            <FrameSwatch
              key={weight}
              label={String(weight)}
              $rounded="xl"
              $border={2}
              $edgeWeight={weight}
            />
          ))}
        </SwatchGrid>
      </Sample>

      <Sample
        title="Edge modifiers"
        code="$edgeHue $edgeChroma $edgeLighten $edgeDarken $edgePush $edgeDark"
        description="The edge has the same lightness, chroma and hue knobs as the layer, applied to the hairline only."
      >
        <SwatchGrid min="7rem">
          <FrameSwatch
            label="Green vivid"
            code='$edgeHue="green" $edgeChroma="vivid"'
            $rounded="xl"
            $border={2}
            $edgeHue="green"
            $edgeChroma="vivid"
          />
          <FrameSwatch
            label="Lighten"
            code="$edgeLighten={40}"
            $rounded="xl"
            $border={2}
            $edgeLighten={40}
          />
          <FrameSwatch
            label="Darken"
            code="$edgeDarken={40}"
            $rounded="xl"
            $border={2}
            $edgeDarken={40}
          />
          <FrameSwatch
            label="No push"
            code="$edgePush={0} $edgeWeight={40}"
            $rounded="xl"
            $border={2}
            $edgePush={0}
            $edgeWeight={40}
          />
          <FrameSwatch
            label="Saturate"
            code='$edge="brand" $edgeSaturate={20}'
            $rounded="xl"
            $border={2}
            $edge="brand"
            $edgeSaturate={20}
          />
          <FrameSwatch
            label="Dark edge"
            code="$edgeDark"
            $rounded="xl"
            $border={2}
            $edgeDark
          />
        </SwatchGrid>
      </Sample>

      <Sample
        title="Concentric nesting"
        code="$rounded inherited through nested frames"
        description="A nested frame shrinks its radius by the padding around it so the corners stay concentric. Force keeps the requested radius instead."
      >
        <Frame $rounded="3xl" $p={4} $border className="grid gap-3">
          <Frame $p={3} $border className="grid gap-3">
            <Frame $p={3} $border>
              <Caption>Three nested frames, one radius.</Caption>
            </Frame>
          </Frame>
          <Frame $rounded="3xl" $forceRounded $p={3} $border>
            <Caption>Forced 3xl inside the same parent.</Caption>
          </Frame>
        </Frame>
      </Sample>

      <Sample
        title="Cover"
        code='$cover $orientation="vertical" | "horizontal"'
        description="A cover child fills the parent's content box, collapses the shared border and rounds only the corners it owns, based on the flow direction."
      >
        <Frame
          $rounded="2xl"
          $p={3}
          $border
          $orientation="vertical"
          className="grid"
        >
          <Frame $cover $p={3} $lightnessOffset $border>
            <Caption>First cover</Caption>
          </Frame>
          <Frame $cover $p={3} $border>
            <Caption>Middle cover</Caption>
          </Frame>
          <Frame $cover $p={3} $lightnessOffset $border>
            <Caption>Last cover</Caption>
          </Frame>
        </Frame>
        <Frame
          $rounded="2xl"
          $p={3}
          $border
          $orientation="horizontal"
          className="flex"
        >
          <Frame $cover $p={3} $lightnessOffset $border className="flex-1">
            <Caption>Start</Caption>
          </Frame>
          <Frame $cover $p={3} $border className="flex-1">
            <Caption>Middle</Caption>
          </Frame>
          <Frame $cover $p={3} $lightnessOffset $border className="flex-1">
            <Caption>End</Caption>
          </Frame>
        </Frame>
      </Sample>

      <Sample
        title="Margin"
        code="$m={2} · $m={4}"
        description="A margin keeps a nested frame off the parent padding while its radius stays concentric with the parent's."
      >
        <Frame
          $rounded="2xl"
          $p={2}
          $border
          $lightnessOffset
          className="grid gap-2"
        >
          <Frame $m={2} $p={3} $border>
            <Caption>$m={2}</Caption>
          </Frame>
          <Frame $m={4} $p={3} $border>
            <Caption>$m={4}</Caption>
          </Frame>
        </Frame>
      </Sample>

      <Sample
        title="Without a layer"
        code="$layer={false} · $frame={false}"
        description="A frame can keep its geometry and paint nothing, or keep its colors and drop the frame context so nested frames ignore it."
      >
        <SwatchGrid min="8rem">
          <Frame
            $layer={false}
            $rounded="xl"
            $p={3}
            className="ring ring-inset"
          >
            <Caption>No layer, geometry only</Caption>
          </Frame>
          <Frame $frame={false} $lightnessOffset $p={3} className="rounded-xl">
            <Caption>Layer, no frame context</Caption>
          </Frame>
        </SwatchGrid>
      </Sample>
    </Samples>
  );
}
