/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Layer } from "@ariakit/ui/components/layer.ariakit.react.tsx";
import { Text } from "@ariakit/ui/components/text.ariakit.react.tsx";
import { COLOR_VALUES } from "@ariakit/ui/utils/styles.ts";
import {
  Caption,
  Sample,
  Samples,
  Swatch,
  SwatchGrid,
} from "./gallery.react.tsx";

const lightnessSteps = [0, 0.5, 1, 2, 4, 8] as const;
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
const harmonies = [
  "complementary",
  "split1",
  "split2",
  "analogous1",
  "analogous2",
  "triadic1",
  "triadic2",
  "tetradic1",
  "tetradic2",
  "tetradic3",
  "square1",
  "square2",
  "square3",
] as const;

function NestedLayers({ color }: { color?: "brand" }) {
  return (
    <Layer $layer={color ?? true} className="grid gap-3 rounded-2xl p-3">
      <Text className="text-sm">Depth 1</Text>
      <Layer $lightnessOffset className="grid gap-3 rounded-xl p-3">
        <Text className="text-sm">Depth 2</Text>
        <Layer $lightnessOffset className="grid gap-3 rounded-lg p-3">
          <Text className="text-sm">Depth 3</Text>
          <Layer $lightnessOffset className="rounded-md p-3">
            <Text className="text-sm">Depth 4</Text>
          </Layer>
        </Layer>
      </Layer>
    </Layer>
  );
}

export function LayerSection() {
  return (
    <Samples>
      <Sample
        wide
        title="Colors"
        code='$layer="brand" | "#635bff" | "ghost" | true'
        description="A theme name paints the layer with that color, a string with any CSS color. Ghost keeps the color system on with a transparent background, and true inherits the parent color unchanged."
      >
        <SwatchGrid>
          {COLOR_VALUES.map((color) => (
            <Swatch
              key={color}
              label={color}
              code={`$layer="${color}"`}
              $layer={color}
            />
          ))}
          <Swatch label="Custom" code='$layer="#635bff"' $layer="#635bff" />
          <Swatch
            label="CSS variable"
            code='$layer="var(--color-teal-500)"'
            $layer="var(--color-teal-500)"
          />
          <Swatch label="Ghost" code='$layer="ghost"' $layer="ghost" />
          <Swatch label="Inherit" code="$layer" />
        </SwatchGrid>
      </Sample>

      <Sample
        title="Lightness offset"
        code="$lightnessOffset={0.5 | 1 | 2 | 4}"
        description="The layer moves away from its parent by up to this many steps, lighter or darker depending on where it sits. Zero pins it to the parent, and high-contrast preferences shrink the distance."
      >
        <SwatchGrid min="6rem">
          {lightnessSteps.map((step) => (
            <Swatch key={step} label={String(step)} $lightnessOffset={step} />
          ))}
        </SwatchGrid>
      </Sample>

      <Sample
        title="Lightness push"
        code="$lightnessPush={0.5 | 1 | 2 | 4}"
        description="The guaranteed minimum shift. High-contrast preferences grow it instead of shrinking it."
      >
        <SwatchGrid min="6rem">
          {lightnessSteps.slice(1).map((step) => (
            <Swatch key={step} label={String(step)} $lightnessPush={step} />
          ))}
        </SwatchGrid>
      </Sample>

      <Sample
        title="Lighten and darken"
        code="$lighten={2} $darken={2}"
        description="Absolute moves in one direction, whatever the parent lightness."
      >
        <SwatchGrid min="6rem">
          <Swatch label="Lighten" code="$lighten" $lighten />
          <Swatch label="Lighten 2" code="$lighten={2}" $lighten={2} />
          <Swatch label="Lighten 4" code="$lighten={4}" $lighten={4} />
          <Swatch label="Darken" code="$darken" $darken />
          <Swatch label="Darken 2" code="$darken={2}" $darken={2} />
          <Swatch label="Darken 4" code="$darken={4}" $darken={4} />
        </SwatchGrid>
      </Sample>

      <Sample
        title="Invert"
        code="$invert"
        description="Flips the base color to the opposite side of the lightness range and doubles every offset that follows."
      >
        <SwatchGrid>
          <Swatch label="Inverted" code="$invert" $invert />
          <Swatch
            label="Inverted brand"
            code='$invert $layer="brand"'
            $invert
            $layer="brand"
          />
          <Swatch
            label="Inverted danger"
            code='$invert $layer="danger"'
            $invert
            $layer="danger"
          />
        </SwatchGrid>
      </Sample>

      <Sample
        title="Mix"
        code='$layer="brand" $mix={15 | 30 | 50}'
        description="Blends the color back toward the parent by a percentage. True is a 50% blend."
      >
        <SwatchGrid min="6rem">
          <Swatch label="Solid" $layer="brand" />
          <Swatch label="15" $layer="brand" $mix={15} />
          <Swatch label="30" $layer="brand" $mix={30} />
          <Swatch label="50" $layer="brand" $mix />
          <Swatch label="75" $layer="brand" $mix={75} />
        </SwatchGrid>
      </Sample>

      <Sample
        title="Contrast"
        code="$contrast | $contrast={50}"
        description="Pushes the layer away from its parent until it reaches the requested contrast. True asks for about 3:1."
      >
        <SwatchGrid min="6rem">
          <Swatch label="Contrast" code="$contrast" $contrast />
          <Swatch label="50" code="$contrast={50}" $contrast={50} />
          <Swatch
            label="Brand"
            code='$layer="brand" $contrast'
            $layer="brand"
            $contrast
          />
        </SwatchGrid>
      </Sample>

      <Sample
        title="Chroma"
        code='$layer="brand" $chroma="muted" | "vivid" | 30'
        description="Sets the saturation outright, by name or as a number from 0 to 40."
      >
        <SwatchGrid min="6rem">
          {chromaSteps.map((chroma) => (
            <Swatch
              key={chroma}
              label={chroma}
              $layer="brand"
              $chroma={chroma}
            />
          ))}
          <Swatch label="30" $layer="brand" $chroma={30} />
          <Swatch
            label="Min vivid"
            code='$chromaMin="vivid"'
            $chromaMin="vivid"
          />
          <Swatch
            label="Max auto"
            code='$layer="brand" $lighten={12} $chromaMax="auto"'
            $layer="brand"
            $lighten={12}
            $chromaMax="auto"
          />
        </SwatchGrid>
      </Sample>

      <Sample
        title="Saturate and desaturate"
        code='$layer="brand" $saturate={8} $desaturate={8}'
        description="Relative chroma moves, capped by the chroma bounds."
      >
        <SwatchGrid min="6rem">
          <Swatch label="Base" $layer="brand" />
          <Swatch label="Saturate" code="$saturate" $layer="brand" $saturate />
          <Swatch
            label="Saturate 12"
            code="$saturate={12}"
            $layer="brand"
            $saturate={12}
          />
          <Swatch
            label="Desaturate"
            code="$desaturate"
            $layer="brand"
            $desaturate
          />
          <Swatch
            label="Desaturate 12"
            code="$desaturate={12}"
            $layer="brand"
            $desaturate={12}
          />
        </SwatchGrid>
      </Sample>

      <Sample
        wide
        title="Hue"
        code='$layer="brand" $hue="red" | "complementary" | 200'
        description="A named hue replaces the color's hue, a harmony derives it from the parent hue, and a number sets the angle."
      >
        <SwatchGrid min="6rem">
          {hueNames.map((hue) => (
            <Swatch key={hue} label={hue} $layer="brand" $hue={hue} />
          ))}
          <Swatch label="200" code="$hue={200}" $layer="brand" $hue={200} />
        </SwatchGrid>
        <Caption>Harmonies, derived from the brand hue.</Caption>
        <SwatchGrid min="6rem">
          {harmonies.map((hue) => (
            <Swatch key={hue} label={hue} $layer="brand" $hue={hue} />
          ))}
        </SwatchGrid>
      </Sample>

      <Sample
        title="Lightness bounds"
        code="$lightnessMin={40} $lightnessMax={60}"
        description="Clamp the final lightness after every other variant has run."
      >
        <SwatchGrid min="6rem">
          <Swatch label="Min 40" code="$lightnessMin={40}" $lightnessMin={40} />
          <Swatch label="Max 60" code="$lightnessMax={60}" $lightnessMax={60} />
          <Swatch
            label="Band"
            code="$lightnessMin={45} $lightnessMax={55}"
            $lightnessMin={45}
            $lightnessMax={55}
          />
        </SwatchGrid>
      </Sample>

      <Sample
        title="Nesting"
        code="$lightnessOffset at every depth"
        description="Each nested layer reads the one around it, so the same offset keeps stepping away from the surface."
      >
        <NestedLayers />
      </Sample>

      <Sample
        title="Nesting on a color"
        code='$layer="brand" then $lightnessOffset'
        description="Nested offsets keep the hue and move only the lightness."
      >
        <NestedLayers color="brand" />
      </Sample>

      <Sample
        title="Text on layers"
        code="Text inside Layer"
        description="Plain text takes the layer's ink. A Text target with a color resolves that color against the layer until it reads."
      >
        <SwatchGrid min="9rem">
          {(["brand", "success", "warning", "danger"] as const).map((color) => (
            <Layer
              key={color}
              $layer={color}
              className="grid gap-1 rounded-xl p-4 ring ring-inset"
            >
              <span className="font-medium">Plain ink</span>
              <Text $text="brand">Brand text</Text>
              <Text $text="danger">Danger text</Text>
              <span className="ak-ink-60 text-sm">Muted ink</span>
            </Layer>
          ))}
        </SwatchGrid>
      </Sample>
    </Samples>
  );
}
