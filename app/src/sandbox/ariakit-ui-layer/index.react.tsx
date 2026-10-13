/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Badge, BadgeLabel } from "@ariakit/ui/components/badge.ariakit.react";
import {
  Button,
  ButtonContent,
  ButtonDescription,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react";
import { Text } from "@ariakit/ui/components/text.ariakit.react";
import { button } from "@ariakit/ui/styles/button";
import { Plus } from "lucide-react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

// Layer, Frame and Text have no other examples, so this sandbox holds only
// their regression fixtures.

// The same cases render on a neutral and a colored layer.
function TextModifierCases() {
  return (
    <>
      <Text>Unmodified text</Text>
      <Text $textChroma="vivid">Chroma modifier</Text>
      <Text $text $textChroma="vivid">
        Chroma modifier with text
      </Text>
      <Text $textChroma={0}>Zero chroma</Text>
      <Text $textChroma="vivid" $textHue="red">
        Hue modifier
      </Text>
      <Text $textPush={60}>Push modifier</Text>
      <Text $textPush={0}>Zero push</Text>
      <Text $text={false} $textChroma="vivid">
        Disabled text
      </Text>
      <Text $text="success" $textChroma="vivid">
        Explicit color
      </Text>
      <div className="flex flex-wrap gap-4">
        <Button $border $textChroma="vivid" $textHue="red">
          <ButtonSlot>
            <Plus />
          </ButtonSlot>
          <ButtonContent>
            <ButtonLabel>Parent modifier</ButtonLabel>
            <ButtonDescription>Parent description</ButtonDescription>
          </ButtonContent>
        </Button>
        <Button $border>
          <ButtonSlot>
            <Plus />
          </ButtonSlot>
          <ButtonContent>
            <ButtonLabel $textChroma="vivid" $textHue="red">
              Child modifier
            </ButtonLabel>
            <ButtonDescription>Child description</ButtonDescription>
          </ButtonContent>
        </Button>
        <Button $border $textChroma="vivid" $textHue="red">
          <ButtonContent>
            <ButtonLabel $text="success">Parent and child</ButtonLabel>
            <ButtonDescription>Both description</ButtonDescription>
          </ButtonContent>
        </Button>
        <Button $border $textChroma="vivid" $textHue="red">
          <ButtonLabel>Nested layer</ButtonLabel>
          <ButtonSlot>
            <Badge>
              <BadgeLabel>New</BadgeLabel>
            </Badge>
          </ButtonSlot>
        </Button>
        <Button $border $textChroma="vivid" $textHue="red" disabled>
          <ButtonSlot>
            <Plus />
          </ButtonSlot>
          <ButtonLabel>Disabled parent</ButtonLabel>
        </Button>
        <Text $text="danger">
          <Button $border disabled>
            <ButtonSlot>
              <Plus />
            </ButtonSlot>
            <ButtonContent>
              <ButtonLabel>Disabled child</ButtonLabel>
              <ButtonDescription>Disabled description</ButtonDescription>
            </ButtonContent>
          </Button>
        </Text>
        {/* Only the recipe class disables this control. */}
        <label
          {...button.jsx({ $border: true, $disabled: true, $text: "danger" })}
        >
          <ButtonSlot>
            <Plus />
          </ButtonSlot>
          <ButtonContent>
            <ButtonLabel>Disabled class</ButtonLabel>
            <ButtonDescription>Class description</ButtonDescription>
          </ButtonContent>
        </label>
        {/* Only the DOM state disables this control. */}
        <fieldset disabled>
          <Button $border $text="danger">
            <ButtonSlot>
              <Plus />
            </ButtonSlot>
            <ButtonContent>
              <ButtonLabel>Disabled fieldset</ButtonLabel>
              <ButtonDescription>Fieldset description</ButtonDescription>
            </ButtonContent>
          </Button>
        </fieldset>
        <Button $border disabled>
          <ButtonLabel>Disabled badge</ButtonLabel>
          <ButtonSlot>
            <Badge>
              <BadgeLabel>New</BadgeLabel>
            </Badge>
          </ButtonSlot>
        </Button>
      </div>
    </>
  );
}
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

      {/* https://github.com/ariakit/ariakit/issues/7865 */}
      <Example
        title="Text color modifiers"
        description="A color modifier that emits output enables adaptive text unless $text is set. A zero push emits none."
        wide
        stretch
        code={`
          <Text>Unmodified text</Text>
          <Text $textChroma="vivid">Chroma modifier</Text>
          <Text $text $textChroma="vivid">Chroma modifier with text</Text>
          <Text $textChroma={0}>Zero chroma</Text>
          <Text $textChroma="vivid" $textHue="red">Hue modifier</Text>
          <Text $textPush={60}>Push modifier</Text>
          <Text $textPush={0}>Zero push</Text>
          <Text $text={false} $textChroma="vivid">Disabled text</Text>
          <Text $text="success" $textChroma="vivid">Explicit color</Text>
          <Button $textChroma="vivid" $textHue="red">
            <ButtonLabel>Parent modifier</ButtonLabel>
          </Button>
          <Button>
            <ButtonLabel $textChroma="vivid" $textHue="red">Child modifier</ButtonLabel>
          </Button>
          <Button $textChroma="vivid" $textHue="red">
            <ButtonLabel $text="success">Parent and child</ButtonLabel>
          </Button>
        `}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Layer $layer="canvas" className="grid gap-4 rounded-lg p-6">
            <TextModifierCases />
          </Layer>
          <Layer $layer="brand" className="grid gap-4 rounded-lg p-6">
            <TextModifierCases />
          </Layer>
        </div>
      </Example>
    </ExampleGrid>
  );
}
