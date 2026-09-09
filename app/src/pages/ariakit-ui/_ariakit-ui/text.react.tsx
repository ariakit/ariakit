/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Layer } from "@ariakit/ui/components/layer.ariakit.react";
import type { TextProps } from "@ariakit/ui/components/text.ariakit.react";
import { Text } from "@ariakit/ui/components/text.ariakit.react";
import { COLOR_VALUES } from "@ariakit/ui/utils/styles";
import {
  Labeled,
  Sample,
  Samples,
  Stage,
  SwatchGrid,
} from "./gallery.react.tsx";

const chromaSteps = ["muted", "balanced", "vivid", "neon"] as const;
const hueNames = [
  "red",
  "orange",
  "yellow",
  "green",
  "cyan",
  "blue",
  "magenta",
] as const;

function Word(props: TextProps) {
  return <Text className="text-lg font-medium" {...props} />;
}

export function TextSection() {
  return (
    <Samples>
      <Sample
        title="Colors"
        code='$text="brand" | "#d946ef" | true'
        description="A theme name or any CSS color, adjusted until it reads against the layer behind it. True derives the ink from the layer itself."
      >
        <Stage>
          <Word>Plain</Word>
          <Word $text>Derived</Word>
          {COLOR_VALUES.map((color) => (
            <Word key={color} $text={color}>
              {color}
            </Word>
          ))}
          <Word $text="#d946ef">Custom</Word>
          <Word $text="var(--color-teal-600)">Variable</Word>
        </Stage>
      </Sample>

      <Sample
        title="Push"
        code='$text="brand" $textPush={0 | 20 | 40 | 60}'
        description="Moves the color further from the layer than readability alone requires."
      >
        <Stage>
          {[0, 20, 40, 60, 80].map((push) => (
            <Labeled key={push} label={String(push)}>
              <Word $text="brand" $textPush={push}>
                Pushed
              </Word>
            </Labeled>
          ))}
        </Stage>
      </Sample>

      <Sample
        title="Lighten and darken"
        code='$text="brand" $textLighten={30} $textDarken={30}'
        description="Absolute moves after the readability floor."
      >
        <Stage>
          <Labeled label="Base">
            <Word $text="brand">Brand</Word>
          </Labeled>
          <Labeled label="Lighten 30">
            <Word $text="brand" $textLighten={30}>
              Brand
            </Word>
          </Labeled>
          <Labeled label="Darken 30">
            <Word $text="brand" $textDarken={30}>
              Brand
            </Word>
          </Labeled>
          <Labeled label="Min 60">
            <Word $text="brand" $textLightnessMin={60}>
              Brand
            </Word>
          </Labeled>
          <Labeled label="Max 40">
            <Word $text="brand" $textLightnessMax={40}>
              Brand
            </Word>
          </Labeled>
        </Stage>
      </Sample>

      <Sample
        title="Chroma"
        code='$text="brand" $textChroma="muted" | "vivid" | 30'
        description="Sets the saturation by name or as a number from 0 to 40, with the relative saturate and desaturate moves beside it."
      >
        <Stage>
          {chromaSteps.map((chroma) => (
            <Labeled key={chroma} label={chroma}>
              <Word $text="brand" $textChroma={chroma}>
                Brand
              </Word>
            </Labeled>
          ))}
          <Labeled label="Saturate 12">
            <Word $text="brand" $textSaturate={12}>
              Brand
            </Word>
          </Labeled>
          <Labeled label="Desaturate 12">
            <Word $text="brand" $textDesaturate={12}>
              Brand
            </Word>
          </Labeled>
          <Labeled label="Min c vivid">
            <Word $text $textChromaMin="vivid">
              Derived
            </Word>
          </Labeled>
        </Stage>
      </Sample>

      <Sample
        title="Warm and cool"
        code='$text="brand" $textWarm={50} $textCool={50}'
        description="Shifts the hue toward the warm or the cool end by a percentage."
      >
        <Stage>
          <Labeled label="Base">
            <Word $text="brand">Brand</Word>
          </Labeled>
          <Labeled label="Warm 50">
            <Word $text="brand" $textWarm={50}>
              Brand
            </Word>
          </Labeled>
          <Labeled label="Warm 100">
            <Word $text="brand" $textWarm={100}>
              Brand
            </Word>
          </Labeled>
          <Labeled label="Cool 50">
            <Word $text="brand" $textCool={50}>
              Brand
            </Word>
          </Labeled>
          <Labeled label="Cool 100">
            <Word $text="brand" $textCool={100}>
              Brand
            </Word>
          </Labeled>
        </Stage>
      </Sample>

      <Sample
        title="Hue"
        code='$text="brand" $textHue="red" | "complementary" | 200'
        description="A named hue, a harmony from the layer hue, or an angle."
      >
        <Stage>
          {hueNames.map((hue) => (
            <Word key={hue} $text="brand" $textHue={hue}>
              {hue}
            </Word>
          ))}
          <Word $text="brand" $textHue="complementary">
            complementary
          </Word>
          <Word $text="brand" $textHue="triadic1">
            triadic1
          </Word>
          <Word $text="brand" $textHue={200}>
            200
          </Word>
        </Stage>
      </Sample>

      <Sample
        wide
        title="Readability across layers"
        code="Text $text inside Layer"
        description="The same text colors on canvas, on a raised layer, on an inverted layer and on colored layers. Each one lands where it reads."
      >
        <SwatchGrid min="11rem">
          <Layer className="grid gap-1 rounded-xl p-4 ring ring-inset">
            <Text className="text-xs">Canvas layer</Text>
            <Text $text="brand">Brand text</Text>
            <Text $text="success">Success text</Text>
            <Text $text="warning">Warning text</Text>
            <Text $text="danger">Danger text</Text>
          </Layer>
          <Layer
            $lightnessOffset={2}
            className="grid gap-1 rounded-xl p-4 ring ring-inset"
          >
            <Text className="text-xs">Offset layer</Text>
            <Text $text="brand">Brand text</Text>
            <Text $text="success">Success text</Text>
            <Text $text="warning">Warning text</Text>
            <Text $text="danger">Danger text</Text>
          </Layer>
          <Layer $invert className="grid gap-1 rounded-xl p-4 ring ring-inset">
            <Text className="text-xs">Inverted layer</Text>
            <Text $text="brand">Brand text</Text>
            <Text $text="success">Success text</Text>
            <Text $text="warning">Warning text</Text>
            <Text $text="danger">Danger text</Text>
          </Layer>
          <Layer
            $layer="brand"
            className="grid gap-1 rounded-xl p-4 ring ring-inset"
          >
            <Text className="text-xs">Brand layer</Text>
            <Text $text="brand">Brand text</Text>
            <Text $text="success">Success text</Text>
            <Text $text="warning">Warning text</Text>
            <Text $text="danger">Danger text</Text>
          </Layer>
          <Layer
            $layer="danger"
            className="grid gap-1 rounded-xl p-4 ring ring-inset"
          >
            <Text className="text-xs">Danger layer</Text>
            <Text $text="brand">Brand text</Text>
            <Text $text="success">Success text</Text>
            <Text $text="warning">Warning text</Text>
            <Text $text="danger">Danger text</Text>
          </Layer>
          <Layer
            $layer="#1f2937"
            className="grid gap-1 rounded-xl p-4 ring ring-inset"
          >
            <Text className="text-xs">Custom dark layer</Text>
            <Text $text="brand">Brand text</Text>
            <Text $text="success">Success text</Text>
            <Text $text="warning">Warning text</Text>
            <Text $text="danger">Danger text</Text>
          </Layer>
        </SwatchGrid>
      </Sample>
    </Samples>
  );
}
