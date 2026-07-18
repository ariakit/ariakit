import { cv } from "clava";
import { includes } from "../utils/includes.ts";
import {
  CHROMA_VALUES,
  HUE_VALUES,
  getChromaStyleClass,
  getScaledStyleClass,
  getLightnessStyleClass,
  COLOR_VALUES,
} from "../utils/styles.ts";
import type { ChromaValues, HueValues, ColorValues } from "../utils/styles.ts";

const DEFAULT_MIX_AMOUNT = 50;
const DEFAULT_CONTRAST_AMOUNT = 25;

export const layer = cv({
  variants: {
    /**
     * Sets the element's base background color, which can be modified by other
     * layer variants.
     *
     * - If set to `true`, the element will inherit the background color from
     *   its parent.
     * - If set to a color, the element will have that color as its base
     *   background color.
     *
     * Set to `false` to disable the layer system.
     */
    $layer(value?: "ghost" | ColorValues | (string & {}) | boolean) {
      if (!value) return;
      if (value === true) {
        return "ak-layer";
      }
      const mapValues = [...COLOR_VALUES, "ghost"] as const;
      if (includes(mapValues, value)) {
        const colorMap = {
          ghost: "ak-layer bg-transparent",
          canvas: "ak-layer ak-layer-canvas",
          brand: "ak-layer ak-layer-brand",
          secondary: "ak-layer ak-layer-secondary",
          success: "ak-layer ak-layer-success",
          warning: "ak-layer ak-layer-warning",
          danger: "ak-layer ak-layer-danger",
        } satisfies Record<(typeof mapValues)[number], string>;
        return colorMap[value];
      }
      return {
        class: "ak-layer ak-layer-color-(--layer-color)",
        style: { "--layer-color": value },
      };
    },
    /**
     * Inverts the layer's base background color.
     */
    $invert: "[--layer-lightness-multiplier:2]",
    /**
     * Automatically adjusts the background color's lightness (0-20). The
     * background color becomes lighter or darker depending on its current
     * lightness. The value represents the **maximum** lightness offset, but
     * it's not guaranteed. If the user has high-contrast preferences, the
     * offset will be lower to allow for greater contrast between the layer and
     * the text.
     *
     * If you want the opposite effect, where the offset increases as contrast
     * goes up, use `$lightnessPush` instead.
     */
    $lightnessOffset(value?: string | number | boolean) {
      return getLightnessStyleClass({
        value,
        property: "--layer-lightness-offset",
        class: "ak-layer-offset-(--layer-lightness-offset)",
      });
    },
    /**
     * Automatically adjusts the background color's lightness (0-20). The
     * background color becomes lighter or darker depending on its current
     * lightness. The value represents the **minimum** guaranteed lightness
     * shift. If the user has high-contrast preferences, the shift will be
     * greater to allow for more contrast between the layer and its parent.
     *
     * If you want the opposite effect, where the offset decreases as contrast
     * goes up, use `$lightnessOffset` instead.
     */
    $lightnessPush(value?: string | number | boolean) {
      return getLightnessStyleClass({
        value,
        property: "--layer-lightness-push",
        class: "ak-layer-push-(--layer-lightness-push)",
      });
    },
    /**
     * Lightens the layer by the specified amount (0-20). When set to `true`, it
     * lightens the layer by one step.
     */
    $lighten(value?: string | number | boolean) {
      return getLightnessStyleClass({
        value,
        property: "--layer-lighten",
        class: "ak-layer-lighten-(--layer-lighten)",
      });
    },
    /**
     * Darkens the layer by the specified amount (0-20). When set to `true`, it
     * darkens the layer by one step.
     */
    $darken(value?: string | number | boolean) {
      return getLightnessStyleClass({
        value,
        property: "--layer-darken",
        class: "ak-layer-darken-(--layer-darken)",
      });
    },
    /**
     * Sets the minimum lightness (0-100) of the background color after all
     * other layer variants have been applied.
     */
    $lightnessMin(value?: string | number | null) {
      return getScaledStyleClass({
        value,
        property: "--layer-lightness-min",
        class: "ak-layer-min-(--layer-lightness-min)",
      });
    },
    /**
     * Sets the maximum lightness (0-100) of the background color after all
     * other layer variants have been applied.
     */
    $lightnessMax(value?: string | number | null) {
      return getScaledStyleClass({
        value,
        property: "--layer-lightness-max",
        class: "ak-layer-max-(--layer-lightness-max)",
      });
    },
    /**
     * Sets the absolute chroma (0-40) of the background color. Higher values
     * mean more saturated colors. Accepts either a named chroma like `"muted"`
     * (`5`), `"balanced"` (`15`), `"vivid"` (`22`), or `"neon"` (`32`), or a
     * numeric value like `40`.
     */
    $chroma(value?: ChromaValues | (string & {}) | number) {
      if (!value) return;
      if (includes(CHROMA_VALUES, value)) {
        const valueMap = {
          muted: "ak-layer-muted",
          balanced: "ak-layer-balanced",
          vivid: "ak-layer-vivid",
          neon: "ak-layer-neon",
        } satisfies Record<ChromaValues, string>;
        return valueMap[value];
      }
      return getScaledStyleClass({
        value,
        property: "--layer-chroma",
        class: `ak-layer-c-(--layer-chroma)`,
      });
    },
    /**
     * Sets the minimum chroma (0-40) of the background color after all other
     * layer variants have been applied.
     */
    $chromaMin(value?: ChromaValues | (string & {}) | number) {
      if (!value) return;
      if (includes(CHROMA_VALUES, value)) {
        const valueMap = {
          muted: "ak-layer-min-c-muted",
          balanced: "ak-layer-min-c-balanced",
          vivid: "ak-layer-min-c-vivid",
          neon: "ak-layer-min-c-neon",
        } satisfies Record<ChromaValues, string>;
        return valueMap[value];
      }
      return getScaledStyleClass({
        value,
        property: "--layer-chroma-min",
        class: `ak-layer-min-c-(--layer-chroma-min)`,
      });
    },
    /**
     * Sets the maximum chroma (0-40) of the background color after all other
     * layer variants have been applied. If set to `auto`, the maximum chroma is
     * set to the highest value possible for the current lightness. This way, a
     * layer with 100% lightness appears white instead of a very bright,
     * saturated color.
     */
    $chromaMax(value?: ChromaValues | "auto" | (string & {}) | number) {
      if (!value) return;
      const mapValues = [...CHROMA_VALUES, "auto"] as const;
      if (includes(mapValues, value)) {
        const valueMap = {
          muted: "ak-layer-max-c-muted",
          balanced: "ak-layer-max-c-balanced",
          vivid: "ak-layer-max-c-vivid",
          neon: "ak-layer-max-c-neon",
          auto: "ak-layer-max-c-auto",
        } satisfies Record<(typeof mapValues)[number], string>;
        return valueMap[value];
      }
      return getScaledStyleClass({
        value,
        property: "--layer-chroma-max",
        class: `ak-layer-max-c-(--layer-chroma-max)`,
      });
    },
    /**
     * Increases the background color's chroma by the specified amount (0-40).
     * When set to `true`, it increases the chroma by one step. It's capped by
     * `$chromaMax`.
     */
    $saturate(value?: string | number | boolean) {
      return getChromaStyleClass({
        value,
        property: "--layer-saturate",
        class: "ak-layer-saturate-(--layer-saturate)",
      });
    },
    /**
     * Decreases the background color's chroma by the specified amount (0-40).
     * When set to `true`, it decreases the chroma by one step. It's capped by
     * `$chromaMin`.
     */
    $desaturate(value?: string | number | boolean) {
      return getChromaStyleClass({
        value,
        property: "--layer-desaturate",
        class: "ak-layer-desaturate-(--layer-desaturate)",
      });
    },
    /**
     * Sets the exact hue of the background color. Accepts a named hue like
     * `"red"` or `"blue"`, a color harmony like `"complementary"`, or a degree
     * value like `240`.
     */
    $hue(value?: HueValues | (string & {}) | number) {
      if (!value) return;
      if (includes(HUE_VALUES, value)) {
        const valueMap = {
          red: "ak-layer-red",
          orange: "ak-layer-orange",
          yellow: "ak-layer-yellow",
          green: "ak-layer-green",
          cyan: "ak-layer-cyan",
          blue: "ak-layer-blue",
          magenta: "ak-layer-magenta",
          complementary: "ak-layer-complementary",
          split1: "ak-layer-split1",
          split2: "ak-layer-split2",
          analogous1: "ak-layer-analogous1",
          analogous2: "ak-layer-analogous2",
          triadic1: "ak-layer-triadic1",
          triadic2: "ak-layer-triadic2",
          tetradic1: "ak-layer-tetradic1",
          tetradic2: "ak-layer-tetradic2",
          tetradic3: "ak-layer-tetradic3",
          square1: "ak-layer-square1",
          square2: "ak-layer-square2",
          square3: "ak-layer-square3",
        } satisfies Record<HueValues, string>;
        return valueMap[value];
      }
      return {
        class: `ak-layer-h-(--layer-hue)`,
        style: { "--layer-hue": `${value}` },
      };
    },
    /**
     * Increases the contrast between the current layer and its parent. Setting
     * it to `true` usually means a 3:1 contrast ratio.
     */
    $contrast(value?: string | number | boolean) {
      return getScaledStyleClass({
        value,
        defaultValue: DEFAULT_CONTRAST_AMOUNT,
        property: "--layer-contrast",
        class: "ak-layer-contrast ak-layer-contrast-(--layer-contrast)",
      });
    },
    /**
     * Sets how much the background color blends with the parent layer, as a
     * percentage. Setting it to `true` means a 50% blend.
     */
    $mix: (value?: string | number | boolean) => {
      return getScaledStyleClass({
        value,
        defaultValue: DEFAULT_MIX_AMOUNT,
        unit: "%",
        property: "--layer-mix",
        class: "ak-layer-mix ak-layer-mix-amount-(--layer-mix)",
      });
    },
  },
  defaultVariants: {
    $layer: true,
    $lightnessOffset(defaultValue, variants) {
      if (variants.$invert) return false;
      return defaultValue;
    },
    $lightnessPush(defaultValue, variants) {
      if (variants.$invert) return 20;
      return defaultValue;
    },
    $lightnessMin(defaultValue, variants) {
      if (variants.$invert) return 23;
      return defaultValue;
    },
    $lightnessMax(defaultValue, variants) {
      if (variants.$invert) return 96;
      return defaultValue;
    },
  },
  refine({ variants, setVariants }) {
    if (variants.$layer !== "ghost") return;
    setVariants({
      $invert: false,
      $lightnessOffset: false,
      $lightnessPush: false,
      $lighten: false,
      $darken: false,
      $lightnessMin: null,
      $lightnessMax: null,
      $chroma: undefined,
      $chromaMin: undefined,
      $chromaMax: undefined,
      $saturate: false,
      $desaturate: false,
      $hue: undefined,
      $contrast: false,
      $mix: false,
    });
  },
});
