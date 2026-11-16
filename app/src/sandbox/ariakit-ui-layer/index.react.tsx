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
import type { FrameProps } from "@ariakit/ui/components/frame.ariakit.react";
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
      {/*
       * https://github.com/ariakit/ariakit/pull/7876#discussion_r4258247930
       */}
      <Text
        $textChroma="vivid"
        $textHue="red"
        render={<Plus aria-label="Icon modifier" />}
      />
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
          <ButtonSlot $kind="box">
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
          <ButtonSlot $kind="box">
            <Badge>
              <BadgeLabel>New</BadgeLabel>
            </Badge>
          </ButtonSlot>
        </Button>
      </div>
    </>
  );
}

/** A dialog-like parent frame for the `$divide` examples. */
function DividePanel({ className, ...props }: FrameProps) {
  const direction = props.$orientation === "horizontal" ? "" : "flex-col";
  return (
    <Frame
      $layer="canvas"
      $lighten
      $border
      $rounded="2xl"
      $forceRounded
      $p={4}
      className={`flex w-56 shadow-xl ${direction} ${className ?? ""}`}
      {...props}
    />
  );
}

interface DivideContentProps {
  label: string;
}

/** Content between the cover frames of a `DividePanel`. */
function DivideContent({ label }: DivideContentProps) {
  return <div className="flex-1 py-3">{label}</div>;
}

const divideStyles: Array<{ label: string; props: FrameProps }> = [
  { label: "Brand divide", props: { $divide: 2, $edge: "brand" } },
  { label: "Dashed divide", props: { $divide: 4, $divideType: "dashed" } },
  { label: "Dotted divide", props: { $divide: 4, $divideType: "dotted" } },
];

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
          <Text $textChroma="vivid" $textHue="red" render={<Plus />} />
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
      <Example
        title="Frame divide"
        description="$divide draws only the sides of a frame that face a sibling in the parent's orientation, so a cover frame leaves the parent edge as it is."
        wide
        code={`
          <Frame $layer="canvas" $lighten $border $rounded="2xl" $p={4}>
            <Frame $cover $darken={0.5} $divide>Header</Frame>
            ...
            <Frame $cover $darken={0.5} $divide>Middle</Frame>
            ...
            <Frame $cover $darken={0.5} $divide>Footer</Frame>
          </Frame>
          <Frame $orientation="horizontal" $border $rounded="2xl" $p={4}>
            <Frame $cover $darken={0.5} $divide>Sidebar</Frame>
            ...
          </Frame>
        `}
      >
        <DividePanel>
          <Frame $cover $darken={0.5} $divide>
            Header
          </Frame>
          <DivideContent label="Content" />
          <Frame $cover $darken={0.5} $divide>
            Middle
          </Frame>
          <DivideContent label="Content" />
          <Frame $cover $darken={0.5} $divide>
            Footer
          </Frame>
        </DividePanel>
        <DividePanel $orientation="horizontal" className="gap-4">
          <Frame $cover $darken={0.5} $divide>
            Sidebar
          </Frame>
          <DivideContent label="Content" />
        </DividePanel>
        <DividePanel $orientation="horizontal" className="gap-4" dir="rtl">
          <Frame $cover $darken={0.5} $divide>
            RTL sidebar
          </Frame>
          <DivideContent label="Content" />
        </DividePanel>
      </Example>

      <Example
        title="Frame divide widths and styles"
        description='A number sets the width in pixels, and $divideType sets the line style. $divide="inherit" takes the width and color of the parent edge.'
        wide
        code={`
          <Frame $cover $darken={0.5} $divide={2} $edge="brand" />
          <Frame $cover $darken={0.5} $divide={4} $divideType="dashed" />
          <Frame $cover $darken={0.5} $divide={4} $divideType="dotted" />
          <Frame $border={4} $borderType="border" $rounded="2xl" $p={4}>
            ...
            <Frame $cover $darken={0.5} $divide="inherit" />
          </Frame>
        `}
      >
        {divideStyles.map(({ label, props }) => (
          <DividePanel key={label}>
            <DivideContent label={label} />
            <Frame $cover $darken={0.5} className="h-10" {...props} />
          </DividePanel>
        ))}
        <DividePanel $border={4} $borderType="border">
          <DivideContent label="Inherited divide" />
          <Frame $cover $darken={0.5} $divide="inherit" className="h-10" />
        </DividePanel>
      </Example>

      <Example
        title="Frame divide without cover"
        description="Without $cover, the first frame omits its start side and the last frame omits its end side."
        wide
        code={`
          <Frame $border $rounded="2xl" $p="none">
            <Frame $p={3}>One</Frame>
            <Frame $p={3} $darken={0.5} $divide>Two</Frame>
            <Frame $p={3}>Three</Frame>
          </Frame>
        `}
      >
        <DividePanel $p="none">
          <Frame $p={3}>One</Frame>
          <Frame $p={3} $darken={0.5} $divide>
            Two
          </Frame>
          <Frame $p={3}>Three</Frame>
        </DividePanel>
        <DividePanel $p="none">
          <Frame $p={3} $darken={0.5} $divide>
            One
          </Frame>
          <Frame $p={3}>Two</Frame>
          <Frame $p={3} $darken={0.5} $divide>
            Three
          </Frame>
        </DividePanel>
        <DividePanel $p="none" $orientation="horizontal">
          <Frame $p={3} className="flex-1">
            One
          </Frame>
          <Frame $p={3} $darken={0.5} $divide className="flex-1">
            Two
          </Frame>
          <Frame $p={3} className="flex-1">
            Three
          </Frame>
        </DividePanel>
      </Example>
    </ExampleGrid>
  );
}
