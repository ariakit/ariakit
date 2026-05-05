import { cv } from "clava";
import { includes } from "../utils/includes.ts";
import {
  CHROMA_VALUES,
  HUE_VALUES,
  getScaledStyleClass,
  type ChromaValues,
  type HueValues,
} from "../utils/styles.ts";

export const text = cv({
  variants: {
    /**
     * Sets the element's base text color, which can be modified by other text
     * variants.
     *
     * - If set to `true`, the element will use the parent layer's background
     *   color as its base text color and adjust it automatically to meet WCAG
     *   AA contrast.
     * - If set to a color, the element will have that color as its base text
     *   color.
     *
     * Set to `false` to disable the text system.
     *
     * **Important**: this should be applied to a descendant, not to the
     * `$layer` element itself.
     */
    $text: {
      true: "ak-text",
      brand: "ak-text ak-text-brand",
      success: "ak-text ak-text-success",
      warning: "ak-text ak-text-warning",
      danger: "ak-text ak-text-danger",
    },
  },
  computedVariants: {
    /**
     * Pushes text lightness farther from the parent layer beyond the automatic
     * readability floor. This value represents the **minimum** lightness
     * offset, from `0` to `100`. It automatically increases as the `--contrast`
     * value increases, like in high-contrast mode.
     */
    $textPush: (value?: string | number) => {
      return getScaledStyleClass({
        value,
        property: "--text-push",
        class: "ak-text-push-(--text-push)",
      });
    },
    /**
     * Lightens the text color by the specified amount (0-100).
     */
    $textLighten: (value?: string | number) => {
      return getScaledStyleClass({
        value,
        property: "--text-lighten",
        class: "ak-text-lighten-(--text-lighten)",
      });
    },
    /**
     * Darkens the text color by the specified amount (0-100).
     */
    $textDarken: (value?: string | number) => {
      return getScaledStyleClass({
        value,
        property: "--text-darken",
        class: "ak-text-darken-(--text-darken)",
      });
    },
    /**
     * Sets the minimum lightness (0-100) of the text color after all other
     * text variants have been applied.
     */
    $textLightnessMin: (value?: string | number) => {
      return getScaledStyleClass({
        value,
        property: "--text-lightness-min",
        class: "ak-text-min-(--text-lightness-min)",
      });
    },
    /**
     * Sets the maximum lightness (0-100) of the text color after all other
     * text variants have been applied.
     */
    $textLightnessMax: (value?: string | number) => {
      return getScaledStyleClass({
        value,
        property: "--text-lightness-max",
        class: "ak-text-max-(--text-lightness-max)",
      });
    },

    /**
     * Sets the exact chroma of the text color. Accepts a named chroma like
     * `"muted"` or `"vivid"`, or a value like `40`.
     */
    $textChroma: (value?: ChromaValues | (string & {}) | number) => {
      if (!value) return;
      if (includes(CHROMA_VALUES, value)) {
        const valueMap = {
          muted: "ak-text-muted",
          balanced: "ak-text-balanced",
          vivid: "ak-text-vivid",
          neon: "ak-text-neon",
        } satisfies Record<ChromaValues, string>;
        return valueMap[value];
      }
      return getScaledStyleClass({
        value,
        property: "--text-chroma",
        class: "ak-text-c-(--text-chroma)",
      });
    },
    /**
     * Increases the text chroma by the specified amount (0-40).
     */
    $textSaturate: (value?: string | number) => {
      return getScaledStyleClass({
        value,
        property: "--text-saturate",
        class: "ak-text-saturate-(--text-saturate)",
      });
    },
    /**
     * Decreases the text chroma by the specified amount (0-40).
     */
    $textDesaturate: (value?: string | number) => {
      return getScaledStyleClass({
        value,
        property: "--text-desaturate",
        class: "ak-text-desaturate-(--text-desaturate)",
      });
    },
    /**
     * Sets the minimum chroma (0-40) of the text color after all other text
     * variants have been applied.
     */
    $textChromaMin: (value?: ChromaValues | (string & {}) | number) => {
      if (!value) return;
      if (includes(CHROMA_VALUES, value)) {
        const valueMap = {
          muted: "ak-text-min-c-muted",
          balanced: "ak-text-min-c-balanced",
          vivid: "ak-text-min-c-vivid",
          neon: "ak-text-min-c-neon",
        } satisfies Record<ChromaValues, string>;
        return valueMap[value];
      }
      return getScaledStyleClass({
        value,
        property: "--text-chroma-min",
        class: "ak-text-min-c-(--text-chroma-min)",
      });
    },
    /**
     * Sets the maximum chroma (0-40) of the text color after all other text
     * variants have been applied.
     */
    $textChromaMax: (value?: ChromaValues | (string & {}) | number) => {
      if (!value) return;
      if (includes(CHROMA_VALUES, value)) {
        const valueMap = {
          muted: "ak-text-max-c-muted",
          balanced: "ak-text-max-c-balanced",
          vivid: "ak-text-max-c-vivid",
          neon: "ak-text-max-c-neon",
        } satisfies Record<ChromaValues, string>;
        return valueMap[value];
      }
      return getScaledStyleClass({
        value,
        property: "--text-chroma-max",
        class: "ak-text-max-c-(--text-chroma-max)",
      });
    },
    /**
     * Sets the exact hue of the text color. Accepts a named hue like
     * `"red"` or `"blue"`, a color harmony like `"complementary"`, or a degree
     * value like `240`.
     */
    $textHue: (value?: HueValues | (string & {}) | number) => {
      if (!value) return;
      if (includes(HUE_VALUES, value)) {
        const valueMap = {
          red: "ak-text-red",
          orange: "ak-text-orange",
          yellow: "ak-text-yellow",
          green: "ak-text-green",
          cyan: "ak-text-cyan",
          blue: "ak-text-blue",
          magenta: "ak-text-magenta",
          complementary: "ak-text-complementary",
          split1: "ak-text-split1",
          split2: "ak-text-split2",
          analogous1: "ak-text-analogous1",
          analogous2: "ak-text-analogous2",
          triadic1: "ak-text-triadic1",
          triadic2: "ak-text-triadic2",
          tetradic1: "ak-text-tetradic1",
          tetradic2: "ak-text-tetradic2",
          tetradic3: "ak-text-tetradic3",
          square1: "ak-text-square1",
          square2: "ak-text-square2",
          square3: "ak-text-square3",
        } satisfies Record<HueValues, string>;
        return valueMap[value];
      }
      return {
        class: "ak-text-h-(--text-hue)",
        style: { "--text-hue": `${value}` },
      };
    },
  },
  defaultVariants: {
    $text: true,
  },
});
