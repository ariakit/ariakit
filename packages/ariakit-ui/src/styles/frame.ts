import { cv } from "clava";
import { includes } from "../utils/includes.ts";
import {
  CHROMA_VALUES,
  HUE_VALUES,
  getScaledStyleClass,
  getLightnessStyleClass,
  type ChromaValues,
  type HueValues,
} from "../utils/styles.ts";
import { layer } from "./layer.ts";

function getSpacingValue(value: string | number) {
  return typeof value === "string"
    ? value
    : `calc(var(--spacing) * (${value}))`;
}

export const frame = cv({
  extend: [layer],
  variants: {
    /**
     * Enables the frame system, which allows you to set the element's radius,
     * padding, margin, borders, and concentric-radius layout.
     */
    $frame: "ak-frame",
    $force: "ak-frame-force",
    $cover: "ak-frame-cover",
    /**
     * Sets the element’s border radius.
     */
    $rounded: {
      unset: "",
      false: "ak-frame-none",
      xs: "ak-frame-xs",
      sm: "ak-frame-sm",
      md: "ak-frame-md",
      lg: "ak-frame-lg",
      xl: "ak-frame-xl",
      "2xl": "ak-frame-2xl",
      "3xl": "ak-frame-3xl",
      "4xl": "ak-frame-4xl",
      full: "ak-frame-full",
    },
    $borderColor: {
      unset: "",
      brand: "ak-edge-brand",
      success: "ak-edge-success",
      warning: "ak-edge-warning",
      danger: "ak-edge-danger",
    },
    $borderRaw: "ak-edge-raw",
    $borderWeight: {
      unset: "",
      adaptive: "ak-edge-0",
      light: "ak-edge-5",
      normal: "ak-edge-10",
      medium: "ak-edge-20",
      bold: "ak-edge-40",
    },
    $borderType: {
      unset: "",
      border: "ak-frame-border-(--border-width)",
      bordering: "ak-frame-bordering-(--border-width)",
      ring: "ak-frame-ring-(--border-width)",
      inset: "ring-(length:--border-width) ring-inset",
      dashed: "ak-frame-border-(--border-width) border-dashed",
      dotted: "ak-frame-border-(--border-width) border-dotted",
    },
    $orientation: {
      unset: "",
      horizontal: "ak-frame-row",
      vertical: "ak-frame-col",
    },
    $frameStart: "ak-frame-start",
    $frameEnd: "ak-frame-end",
  },
  computedVariants: {
    $p: (value?: "unset" | "none" | (string & {}) | number) => {
      if (value == null) return;
      if (value === "unset") return;
      if (value === "none") return "ak-frame-p-0";
      return {
        class: "ak-frame-p-(--frame-padding)",
        style: { "--frame-padding": getSpacingValue(value) },
      };
    },
    $m: (value?: "unset" | "none" | (string & {}) | number) => {
      if (value == null) return;
      if (value === "unset") return;
      if (value === "none") return "ak-frame-m-0";
      return {
        class: "ak-frame-m-(--frame-margin)",
        style: { "--frame-margin": getSpacingValue(value) },
      };
    },
    $border: (value?: "inherit" | boolean | number) => {
      if (value == null) return;
      if (value === false) return;
      if (value === "inherit") {
        return "ak-frame-bordering-inherit ak-edge-inherit";
      }
      if (value === true) {
        value = 1;
      }
      return { style: { "--border-width": `${value}px` } };
    },
    $borderAlpha: (value?: string | number) => {
      return getScaledStyleClass({
        value,
        allowZero: true,
        property: "--border-alpha",
        class: "ak-edge-alpha-(--border-alpha)",
      });
    },
    $borderPush: (value?: string | number | boolean) => {
      return getLightnessStyleClass({
        value,
        property: "--border-push",
        class: "ak-edge-push-(--border-push)",
      });
    },
    $borderLightness: (value?: string | number) => {
      return getLightnessStyleClass({
        value,
        property: "--border-lightness",
        class: "ak-edge-l-(--border-lightness)",
      });
    },
    $borderLighten: (value?: string | number | boolean) => {
      return getLightnessStyleClass({
        value,
        property: "--border-lighten",
        class: "ak-edge-lighten-(--border-lighten)",
      });
    },
    $borderDarken: (value?: string | number | boolean) => {
      return getLightnessStyleClass({
        value,
        property: "--border-darken",
        class: "ak-edge-darken-(--border-darken)",
      });
    },
    $borderLightnessMin: (value?: string | number) => {
      return getScaledStyleClass({
        value,
        property: "--border-lightness-min",
        class: "ak-edge-min-(--border-lightness-min)",
      });
    },
    $borderLightnessMax: (value?: string | number) => {
      return getScaledStyleClass({
        value,
        property: "--border-lightness-max",
        class: "ak-edge-max-(--border-lightness-max)",
      });
    },
    $borderSaturate: (value?: string | number | boolean) => {
      return getScaledStyleClass({
        value,
        defaultValue: 1,
        property: "--border-saturate",
        class: "ak-edge-saturate-(--border-saturate)",
      });
    },
    $borderDesaturate: (value?: string | number | boolean) => {
      return getScaledStyleClass({
        value,
        defaultValue: 1,
        property: "--border-desaturate",
        class: "ak-edge-desaturate-(--border-desaturate)",
      });
    },
    $borderChroma: (value?: ChromaValues | (string & {}) | number) => {
      if (!value) return;
      if (includes(CHROMA_VALUES, value)) {
        const valueMap = {
          muted: "ak-edge-muted",
          balanced: "ak-edge-balanced",
          vivid: "ak-edge-vivid",
          neon: "ak-edge-neon",
        } satisfies Record<ChromaValues, string>;
        return valueMap[value];
      }
      return getScaledStyleClass({
        value,
        property: "--border-chroma",
        class: "ak-edge-c-(--border-chroma)",
      });
    },
    $borderChromaMin: (value?: ChromaValues | (string & {}) | number) => {
      if (!value) return;
      if (includes(CHROMA_VALUES, value)) {
        const valueMap = {
          muted: "ak-edge-min-c-muted",
          balanced: "ak-edge-min-c-balanced",
          vivid: "ak-edge-min-c-vivid",
          neon: "ak-edge-min-c-neon",
        } satisfies Record<ChromaValues, string>;
        return valueMap[value];
      }
      return getScaledStyleClass({
        value,
        property: "--border-chroma-min",
        class: "ak-edge-min-c-(--border-chroma-min)",
      });
    },
    $borderChromaMax: (value?: ChromaValues | (string & {}) | number) => {
      if (!value) return;
      if (includes(CHROMA_VALUES, value)) {
        const valueMap = {
          muted: "ak-edge-max-c-muted",
          balanced: "ak-edge-max-c-balanced",
          vivid: "ak-edge-max-c-vivid",
          neon: "ak-edge-max-c-neon",
        } satisfies Record<ChromaValues, string>;
        return valueMap[value];
      }
      return getScaledStyleClass({
        value,
        property: "--border-chroma-max",
        class: "ak-edge-max-c-(--border-chroma-max)",
      });
    },
    $borderHue: (value?: HueValues | (string & {}) | number) => {
      if (!value) return;
      if (includes(HUE_VALUES, value)) {
        const valueMap = {
          red: "ak-edge-red",
          orange: "ak-edge-orange",
          yellow: "ak-edge-yellow",
          green: "ak-edge-green",
          cyan: "ak-edge-cyan",
          blue: "ak-edge-blue",
          magenta: "ak-edge-magenta",
          complementary: "ak-edge-complementary",
          split1: "ak-edge-split1",
          split2: "ak-edge-split2",
          analogous1: "ak-edge-analogous1",
          analogous2: "ak-edge-analogous2",
          triadic1: "ak-edge-triadic1",
          triadic2: "ak-edge-triadic2",
          tetradic1: "ak-edge-tetradic1",
          tetradic2: "ak-edge-tetradic2",
          tetradic3: "ak-edge-tetradic3",
          square1: "ak-edge-square1",
          square2: "ak-edge-square2",
          square3: "ak-edge-square3",
        } satisfies Record<HueValues, string>;
        return valueMap[value];
      }
      return {
        class: "ak-edge-h-(--border-hue)",
        style: { "--border-hue": `${value}` },
      };
    },
    $borderHueRotate: (value?: string | number) => {
      if (!value) return;
      return {
        class: "ak-edge-h-rotate-(--border-hue-rotate)",
        style: { "--border-hue-rotate": `${value}` },
      };
    },
  },
  defaultVariants: {
    $frame: true,
    $borderType: "border",
  },
  computed: ({ variants, setDefaultVariants }) => {
    if (variants.$border === "inherit") {
      setDefaultVariants({
        $borderType: "unset",
        $borderColor: "unset",
        $borderWeight: "unset",
      });
    }
  },
});
