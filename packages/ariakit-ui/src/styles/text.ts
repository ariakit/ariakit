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
  class: "text",
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
     * **Important**: When used on a `$layer` element, this applies to `$text`
     * or SVG elements inside it, not to text direclty inside the layer element.
     */
    $text: {
      true: "ui-text:ak-text",
      primary: "ui-text:ak-text ui-text:ak-text-primary",
      secondary: "ui-text:ak-text ui-text:ak-text-secondary",
      brand: "ui-text:ak-text ui-text:ak-text-brand",
      success: "ui-text:ak-text ui-text:ak-text-success",
      warning: "ui-text:ak-text ui-text:ak-text-warning",
      danger: "ui-text:ak-text ui-text:ak-text-danger",
    },
    /**
     * Pushes text lightness farther from the parent layer beyond the automatic
     * readability floor. This value represents the **minimum** lightness
     * offset, from `0` to `100`. It automatically increases as the `--contrast`
     * value increases, like in high-contrast mode.
     *
     * **Important**: When used on a `$layer` element, this applies to `$text`
     * or SVG elements inside it, not to text direclty inside the layer element.
     */
    $textPush(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--text-push",
        class: "ui-text:ak-text-push-(--text-push)",
      });
    },
    /**
     * Lightens the text color by the specified amount (0-100).
     *
     * **Important**: When used on a `$layer` element, this applies to `$text`
     * or SVG elements inside it, not to text direclty inside the layer element.
     */
    $textLighten(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--text-lighten",
        class: "ui-text:ak-text-lighten-(--text-lighten)",
      });
    },
    /**
     * Darkens the text color by the specified amount (0-100).
     *
     * **Important**: When used on a `$layer` element, this applies to `$text`
     * or SVG elements inside it, not to text direclty inside the layer element.
     */
    $textDarken(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--text-darken",
        class: "ui-text:ak-text-darken-(--text-darken)",
      });
    },
    /**
     * Sets the minimum lightness (0-100) of the text color after all other
     * text variants have been applied.
     *
     * **Important**: When used on a `$layer` element, this applies to `$text`
     * or SVG elements inside it, not to text direclty inside the layer element.
     */
    $textLightnessMin(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--text-lightness-min",
        class: "ui-text:ak-text-min-(--text-lightness-min)",
      });
    },
    /**
     * Sets the maximum lightness (0-100) of the text color after all other
     * text variants have been applied.
     *
     * **Important**: When used on a `$layer` element, this applies to `$text`
     * or SVG elements inside it, not to text direclty inside the layer element.
     */
    $textLightnessMax(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--text-lightness-max",
        class: "ui-text:ak-text-max-(--text-lightness-max)",
      });
    },

    /**
     * Sets the exact chroma of the text color. Accepts a named chroma like
     * `"muted"` or `"vivid"`, or a value like `40`.
     *
     * **Important**: When used on a `$layer` element, this applies to `$text`
     * or SVG elements inside it, not to text direclty inside the layer element.
     */
    $textChroma(value?: ChromaValues | (string & {}) | number) {
      if (!value) return;
      if (includes(CHROMA_VALUES, value)) {
        const valueMap = {
          muted: "ui-text:ak-text-muted",
          balanced: "ui-text:ak-text-balanced",
          vivid: "ui-text:ak-text-vivid",
          neon: "ui-text:ak-text-neon",
        } satisfies Record<ChromaValues, string>;
        return valueMap[value];
      }
      return getScaledStyleClass({
        value,
        property: "--text-chroma",
        class: "ui-text:ak-text-c-(--text-chroma)",
      });
    },
    /**
     * Increases the text chroma by the specified amount (0-40).
     *
     * **Important**: When used on a `$layer` element, this applies to `$text`
     * or SVG elements inside it, not to text direclty inside the layer element.
     */
    $textSaturate(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--text-saturate",
        class: "ui-text:ak-text-saturate-(--text-saturate)",
      });
    },
    /**
     * Decreases the text chroma by the specified amount (0-40).
     *
     * **Important**: When used on a `$layer` element, this applies to `$text`
     * or SVG elements inside it, not to text direclty inside the layer element.
     */
    $textDesaturate(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--text-desaturate",
        class: "ui-text:ak-text-desaturate-(--text-desaturate)",
      });
    },
    /**
     * Sets the minimum chroma (0-40) of the text color after all other text
     * variants have been applied.
     *
     * **Important**: When used on a `$layer` element, this applies to `$text`
     * or SVG elements inside it, not to text direclty inside the layer element.
     */
    $textChromaMin(value?: ChromaValues | (string & {}) | number) {
      if (!value) return;
      if (includes(CHROMA_VALUES, value)) {
        const valueMap = {
          muted: "ui-text:ak-text-min-c-muted",
          balanced: "ui-text:ak-text-min-c-balanced",
          vivid: "ui-text:ak-text-min-c-vivid",
          neon: "ui-text:ak-text-min-c-neon",
        } satisfies Record<ChromaValues, string>;
        return valueMap[value];
      }
      return getScaledStyleClass({
        value,
        property: "--text-chroma-min",
        class: "ui-text:ak-text-min-c-(--text-chroma-min)",
      });
    },
    /**
     * Sets the maximum chroma (0-40) of the text color after all other text
     * variants have been applied.
     *
     * **Important**: When used on a `$layer` element, this applies to `$text`
     * or SVG elements inside it, not to text direclty inside the layer element.
     */
    $textChromaMax(value?: ChromaValues | (string & {}) | number) {
      if (!value) return;
      if (includes(CHROMA_VALUES, value)) {
        const valueMap = {
          muted: "ui-text:ak-text-max-c-muted",
          balanced: "ui-text:ak-text-max-c-balanced",
          vivid: "ui-text:ak-text-max-c-vivid",
          neon: "ui-text:ak-text-max-c-neon",
        } satisfies Record<ChromaValues, string>;
        return valueMap[value];
      }
      return getScaledStyleClass({
        value,
        property: "--text-chroma-max",
        class: "ui-text:ak-text-max-c-(--text-chroma-max)",
      });
    },
    /**
     * Sets the exact hue of the text color. Accepts a named hue like
     * `"red"` or `"blue"`, a color harmony like `"complementary"`, or a degree
     * value like `240`.
     *
     * **Important**: When used on a `$layer` element, this applies to `$text`
     * or SVG elements inside it, not to text direclty inside the layer element.
     */
    $textHue(value?: HueValues | (string & {}) | number) {
      if (!value) return;
      if (includes(HUE_VALUES, value)) {
        const valueMap = {
          red: "ui-text:ak-text-red",
          orange: "ui-text:ak-text-orange",
          yellow: "ui-text:ak-text-yellow",
          green: "ui-text:ak-text-green",
          cyan: "ui-text:ak-text-cyan",
          blue: "ui-text:ak-text-blue",
          magenta: "ui-text:ak-text-magenta",
          complementary: "ui-text:ak-text-complementary",
          split1: "ui-text:ak-text-split1",
          split2: "ui-text:ak-text-split2",
          analogous1: "ui-text:ak-text-analogous1",
          analogous2: "ui-text:ak-text-analogous2",
          triadic1: "ui-text:ak-text-triadic1",
          triadic2: "ui-text:ak-text-triadic2",
          tetradic1: "ui-text:ak-text-tetradic1",
          tetradic2: "ui-text:ak-text-tetradic2",
          tetradic3: "ui-text:ak-text-tetradic3",
          square1: "ui-text:ak-text-square1",
          square2: "ui-text:ak-text-square2",
          square3: "ui-text:ak-text-square3",
        } satisfies Record<HueValues, string>;
        return valueMap[value];
      }
      return {
        class: "ui-text:ak-text-h-(--text-hue)",
        style: { "--text-hue": `${value}` },
      };
    },
  },
  defaultVariants: {
    $text({ variants, defaultValue }) {
      // Enable the text system if any text variant is set.
      const hasValue = Object.values(variants).some(Boolean);
      return hasValue ? true : defaultValue;
    },
  },
});
