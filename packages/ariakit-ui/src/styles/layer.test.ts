import { expect, test } from "vitest";
import { edge } from "./edge.ts";
import { layer } from "./layer.ts";
import { text } from "./text.ts";

const recipes = [
  {
    recipe: layer,
    variants: [
      ["$hue", "--layer-hue", "ak-layer-h-(--layer-hue)"],
      ["$chroma", "--layer-chroma", "ak-layer-c-(--layer-chroma)"],
      [
        "$chromaMin",
        "--layer-chroma-min",
        "ak-layer-min-c-(--layer-chroma-min)",
      ],
      [
        "$chromaMax",
        "--layer-chroma-max",
        "ak-layer-max-c-(--layer-chroma-max)",
      ],
      [
        "$lightnessMin",
        "--layer-lightness-min",
        "ak-layer-min-(--layer-lightness-min)",
      ],
      [
        "$lightnessMax",
        "--layer-lightness-max",
        "ak-layer-max-(--layer-lightness-max)",
      ],
    ],
  },
  {
    recipe: text,
    variants: [
      ["$textHue", "--text-hue", "ui-text:ak-text-h-(--text-hue)"],
      ["$textChroma", "--text-chroma", "ui-text:ak-text-c-(--text-chroma)"],
      [
        "$textChromaMin",
        "--text-chroma-min",
        "ui-text:ak-text-min-c-(--text-chroma-min)",
      ],
      [
        "$textChromaMax",
        "--text-chroma-max",
        "ui-text:ak-text-max-c-(--text-chroma-max)",
      ],
      [
        "$textLightnessMin",
        "--text-lightness-min",
        "ui-text:ak-text-min-(--text-lightness-min)",
      ],
      [
        "$textLightnessMax",
        "--text-lightness-max",
        "ui-text:ak-text-max-(--text-lightness-max)",
      ],
    ],
  },
  {
    recipe: edge,
    variants: [
      ["$edgeHue", "--edge-hue", "ak-edge-h-(--edge-hue)"],
      ["$edgeChroma", "--edge-chroma", "ak-edge-c-(--edge-chroma)"],
      [
        "$edgeChromaMin",
        "--edge-chroma-min",
        "ak-edge-min-c-(--edge-chroma-min)",
      ],
      [
        "$edgeChromaMax",
        "--edge-chroma-max",
        "ak-edge-max-c-(--edge-chroma-max)",
      ],
      [
        "$edgeLightnessMin",
        "--edge-lightness-min",
        "ak-edge-min-(--edge-lightness-min)",
      ],
      [
        "$edgeLightnessMax",
        "--edge-lightness-max",
        "ak-edge-max-(--edge-lightness-max)",
      ],
    ],
  },
] as const;

for (const { recipe, variants } of recipes) {
  for (const [variant, property, className] of variants) {
    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974543567
    test(`${variant} preserves numeric and string zero`, () => {
      for (const value of [0, "0"]) {
        const result = recipe({ [variant]: value });
        expect(result.class.split(" ")).toContain(className);
        expect(result.style).toEqual({
          [property]: property.endsWith("-hue") ? "0" : "calc((0) / 100)",
        });
      }
    });

    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974543567
    test(`${variant} omits empty values`, () => {
      for (const value of [undefined, null, ""]) {
        const result = recipe({ [variant]: value });
        expect(result.class.split(" ")).not.toContain(className);
        expect(result.style).toEqual({});
      }
    });
  }
}

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974543567
test("keeps layer delta zero and Boolean defaults distinct", () => {
  expect(layer({ $lighten: 0 }).style).toEqual({});
  expect(layer({ $lighten: false }).style).toEqual({});
  expect(layer({ $lighten: true }).style).toEqual({
    "--layer-lighten":
      "calc((1) * calc(5 * var(--layer-lightness-multiplier, 1)) / 100)",
  });
  expect(layer({ $lightnessOffset: 0 }).style).toEqual({
    "--layer-lightness-offset":
      "calc((0) * calc(5 * var(--layer-lightness-multiplier, 1)) / 100)",
  });
  expect(layer({ $lightnessOffset: false }).style).toEqual({});
  expect(layer({ $lightnessOffset: "" }).style).toEqual({});
});
