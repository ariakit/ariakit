import { cv } from "clava";
import { includes } from "../utils/includes.ts";
import {
  CHROMA_VALUES,
  HUE_VALUES,
  getChromaStyleClass,
  getScaledStyleClass,
  getLightnessStyleClass,
  type ChromaValues,
  type HueValues,
} from "../utils/styles.ts";

export const text = cv({
  variants: {
    /**
     * Enables the text system, which allows you to color inline text with
     * automatic contrast against the parent layer.
     */
    /**
     * Sets the element's text color. Use `auto` to inherit the parent’s text
     * color.
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
     * Pushes text lightness away from the parent layer beyond the automatic
     * readable floor.
     */
    $textPush: (value?: string | number | boolean) => {
      return getLightnessStyleClass({
        value,
        property: "--text-push",
        class: "ak-text-push-(--text-push)",
      });
    },
    /**
     * Sets the absolute text lightness.
     */
    $textLightness: (value?: string | number) => {
      return getLightnessStyleClass({
        value,
        allowZero: true,
        property: "--text-lightness",
        class: "ak-text-l-(--text-lightness)",
      });
    },
    /**
     * Lightens the text color by the specified amount.
     */
    $textLighten: (value?: string | number | boolean) => {
      return getLightnessStyleClass({
        value,
        property: "--text-lighten",
        class: "ak-text-lighten-(--text-lighten)",
      });
    },
    /**
     * Darkens the text color by the specified amount.
     */
    $textDarken: (value?: string | number | boolean) => {
      return getLightnessStyleClass({
        value,
        property: "--text-darken",
        class: "ak-text-darken-(--text-darken)",
      });
    },
    /**
     * Sets the minimum text lightness.
     */
    $textLightnessMin: (value?: string | number) => {
      return getScaledStyleClass({
        value,
        property: "--text-lightness-min",
        class: "ak-text-min-(--text-lightness-min)",
      });
    },
    /**
     * Sets the maximum text lightness.
     */
    $textLightnessMax: (value?: string | number) => {
      return getScaledStyleClass({
        value,
        property: "--text-lightness-max",
        class: "ak-text-max-(--text-lightness-max)",
      });
    },
    /**
     * Increases the text chroma by the specified amount.
     */
    $textSaturate: (value?: string | number | boolean) => {
      return getChromaStyleClass({
        value,
        property: "--text-saturate",
        class: "ak-text-saturate-(--text-saturate)",
      });
    },
    /**
     * Decreases the text chroma by the specified amount.
     */
    $textDesaturate: (value?: string | number | boolean) => {
      return getChromaStyleClass({
        value,
        property: "--text-desaturate",
        class: "ak-text-desaturate-(--text-desaturate)",
      });
    },
    /**
     * Shifts the text hue toward the warm hue.
     */
    $textWarm: (value?: string | number | boolean) => {
      return getScaledStyleClass({
        value,
        defaultValue: 1,
        property: "--text-warm",
        class: "ak-text-warm-(--text-warm)",
      });
    },
    /**
     * Shifts the text hue toward the cool hue.
     */
    $textCool: (value?: string | number | boolean) => {
      return getScaledStyleClass({
        value,
        defaultValue: 1,
        property: "--text-cool",
        class: "ak-text-cool-(--text-cool)",
      });
    },
    /**
     * Sets the absolute text chroma.
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
     * Sets the minimum text chroma.
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
     * Sets the maximum text chroma.
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
     * Sets the absolute text hue.
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
    /**
     * Rotates the text hue by the specified amount.
     */
    $textHueRotate: (value?: string | number) => {
      if (!value) return;
      return {
        class: "ak-text-h-rotate-(--text-hue-rotate)",
        style: { "--text-hue-rotate": `${value}` },
      };
    },
  },
  defaultVariants: {
    $text: true,
  },
});
