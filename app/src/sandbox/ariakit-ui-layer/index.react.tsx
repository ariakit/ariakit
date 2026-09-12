/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react";
import { Text } from "@ariakit/ui/components/text.ariakit.react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

// Layer, Frame and Text have no other examples, so this sandbox holds only
// their regression fixture.
export default function LayerExamples() {
  return (
    <ExampleGrid>
      {/* Migrated from the layer-color-values sandbox with the same markup. */}
      <Example
        title="Layer color values"
        wide
        stretch
        code={`
          <Layer $layer="brand" $hue={0}>Numeric zero</Layer>
          <Layer $layer="brand" $hue="0">String zero</Layer>
          <Layer $layer="brand" $hue={120}>120 degrees</Layer>
          <Layer $layer="brand" $chroma={0}>Zero chroma</Layer>
          <Layer $layer="brand" $chroma="0">String zero chroma</Layer>
          <Layer $layer="brand" $lightnessMax={0}>Zero maximum lightness</Layer>
          <Layer $layer="brand" $lightnessMax="0">…</Layer>
          <Layer $layer="brand">Unmodified layer</Layer>
          <Layer $layer="brand" $chroma="">Empty chroma</Layer>
          <Layer $layer="canvas">
            <Text $text="brand" $textHue={0}>Numeric text hue</Text>
            <Text $text="brand" $textHue="0">String text hue</Text>
            <Text $text="brand" $textHue={120}>Other text hue</Text>
            <Frame $edge="brand" $edgeRaw $edgeHue={0} $border $borderType="border" $p={3}>Numeric edge hue</Frame>
            <Frame $edge="brand" $edgeRaw $edgeHue="0" $border $borderType="border" $p={3}>String edge hue</Frame>
            <Frame $edge="brand" $edgeRaw $edgeHue={120} $border $borderType="border" $p={3}>Other edge hue</Frame>
          </Layer>
        `}
      >
        {/*
         * Numeric zero must match its string form; empty strings keep the
         * defaults.
         */}
        <div className="grid gap-4">
          <Layer $layer="brand" $hue={0} className="rounded-lg p-6">
            Numeric zero
          </Layer>
          <Layer $layer="brand" $hue="0" className="rounded-lg p-6">
            String zero
          </Layer>
          <Layer $layer="brand" $hue={120} className="rounded-lg p-6">
            120 degrees
          </Layer>
          <Layer $layer="brand" $chroma={0} className="rounded-lg p-6">
            Zero chroma
          </Layer>
          <Layer $layer="brand" $chroma="0" className="rounded-lg p-6">
            String zero chroma
          </Layer>
          <Layer $layer="brand" $lightnessMax={0} className="rounded-lg p-6">
            Zero maximum lightness
          </Layer>
          <Layer $layer="brand" $lightnessMax="0" className="rounded-lg p-6">
            String zero maximum lightness
          </Layer>
          <Layer $layer="brand" className="rounded-lg p-6">
            Unmodified layer
          </Layer>
          <Layer $layer="brand" $chroma="" className="rounded-lg p-6">
            Empty chroma
          </Layer>
          <Layer $layer="canvas" className="grid gap-4 p-6">
            <Text $text="brand" $textHue={0}>
              Numeric text hue
            </Text>
            <Text $text="brand" $textHue="0">
              String text hue
            </Text>
            <Text $text="brand" $textHue={120}>
              Other text hue
            </Text>
            {/*
             * Raw edges keep their hue visible without the contrast adjustment.
             */}
            <Frame
              $edge="brand"
              $edgeRaw
              $edgeHue={0}
              $border
              $borderType="border"
              $p={3}
            >
              Numeric edge hue
            </Frame>
            <Frame
              $edge="brand"
              $edgeRaw
              $edgeHue="0"
              $border
              $borderType="border"
              $p={3}
            >
              String edge hue
            </Frame>
            <Frame
              $edge="brand"
              $edgeRaw
              $edgeHue={120}
              $border
              $borderType="border"
              $p={3}
            >
              Other edge hue
            </Frame>
          </Layer>
        </div>
      </Example>
    </ExampleGrid>
  );
}
