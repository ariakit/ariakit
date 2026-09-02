import { cv } from "clava";
import { includes } from "../utils/includes.ts";
import {
  CHROMA_VALUES,
  HUE_VALUES,
  getScaledStyleClass,
} from "../utils/styles.ts";
import type { ChromaValues, ColorValues, HueValues } from "../utils/styles.ts";
import { layer } from "./layer.ts";

const EDGE_COLOR_VALUES = [
  "brand",
  "success",
  "warning",
  "danger",
] as const satisfies readonly ColorValues[];

export type EdgeColorValues = (typeof EDGE_COLOR_VALUES)[number];

const EDGE_WEIGHT_VALUES = [
  "adaptive",
  "light",
  "normal",
  "medium",
  "bold",
] as const;

export type EdgeWeightValues = (typeof EDGE_WEIGHT_VALUES)[number];

/**
 * Checks whether a value is one of the named colors accepted by the
 * `$edge` variant.
 */
export function isEdgeColor(value: unknown): value is EdgeColorValues {
  return includes(EDGE_COLOR_VALUES, value);
}

// The hairline color these variants tune is derived by the layer utility on
// the same element, and none of the channels they write inherit, so an element
// that carries no layer of its own gets nothing from them. That is why this
// extends `layer` rather than standing beside it.
export const edge = cv({
  extend: [layer],
  variants: {
    /**
     * Sets the edge color. By default, it's based on the layer's background
     * color.
     */
    $edge: {
      unset: "",
      brand: "ak-edge-brand",
      success: "ak-edge-success",
      warning: "ak-edge-warning",
      danger: "ak-edge-danger",
    } satisfies Record<EdgeColorValues | "unset", string>,
    /**
     * Applies the edge color exactly as specified, without the default alpha
     * and lightness adjustments.
     */
    $edgeRaw: "ak-edge-raw",
    /**
     * Sets the edge opacity. Accepts a named weight or a numeric value
     * (0-100). Setting it to `adaptive` makes the edge appear only in
     * high-contrast mode. A single overridable channel: instance values
     * always replace the default instead of fighting it by stylesheet
     * order.
     */
    $edgeWeight(value?: EdgeWeightValues | "unset" | (string & {}) | number) {
      if (value == null) return;
      if (value === "unset") return;
      if (includes(EDGE_WEIGHT_VALUES, value)) {
        const valueMap = {
          adaptive: "ak-edge-0",
          light: "ak-edge-5",
          normal: "ak-edge-10",
          medium: "ak-edge-20",
          bold: "ak-edge-40",
        } satisfies Record<EdgeWeightValues, string>;
        return valueMap[value];
      }
      return getScaledStyleClass({
        value,
        allowZero: true,
        property: "--edge-alpha",
        class: "ak-edge-alpha-(--edge-alpha)",
      });
    },
    /**
     * Uses very dark edges on low-dark layers, typically for native-app-like
     * interfaces with dark surfaces and black or nearly black dividers.
     */
    $edgeDark:
      "ak-dark-low:ak-edge-push-[-0.28] ak-dark-low:ak-edge-alpha-[calc((1-l)*(1-l))]",
    /**
     * Pushes the edge lightness away from the current color to create
     * contrast. By default, it's set to `100` (full contrast). Set it to `0`,
     * or use `$edgeRaw` (which sets both alpha and lightness), to use the
     * exact lightness of the base edge color.
     */
    $edgePush(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--edge-push",
        class: "ak-edge-push-(--edge-push)",
      });
    },
    /**
     * Lightens the edge color by the specified amount (0-100).
     */
    $edgeLighten(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--edge-lighten",
        class: "ak-edge-lighten-(--edge-lighten)",
      });
    },
    /**
     * Darkens the edge color by the specified amount (0-100).
     */
    $edgeDarken(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--edge-darken",
        class: "ak-edge-darken-(--edge-darken)",
      });
    },
    /**
     * Sets the minimum lightness (0-100) of the edge color after all other
     * edge variants have been applied.
     */
    $edgeLightnessMin(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--edge-lightness-min",
        class: "ak-edge-min-(--edge-lightness-min)",
      });
    },
    /**
     * Sets the maximum lightness (0-100) of the edge color after all other
     * edge variants have been applied.
     */
    $edgeLightnessMax(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--edge-lightness-max",
        class: "ak-edge-max-(--edge-lightness-max)",
      });
    },
    /**
     * Sets the absolute chroma (0-40) of the edge color. Higher values mean
     * more saturated colors. Accepts either a named chroma like `"muted"`
     * (`5`), `"balanced"` (`15`), `"vivid"` (`22`), or `"neon"` (`32`), or a
     * numeric value like `40`.
     */
    $edgeChroma(value?: ChromaValues | (string & {}) | number) {
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
        property: "--edge-chroma",
        class: "ak-edge-c-(--edge-chroma)",
      });
    },
    /**
     * Increases the edge chroma by the specified amount (0-40).
     */
    $edgeSaturate(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--edge-saturate",
        class: "ak-edge-saturate-(--edge-saturate)",
      });
    },
    /**
     * Decreases the edge chroma by the specified amount (0-40).
     */
    $edgeDesaturate(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--edge-desaturate",
        class: "ak-edge-desaturate-(--edge-desaturate)",
      });
    },
    /**
     * Sets the minimum chroma (0-40) of the edge color after all other
     * edge variants have been applied.
     */
    $edgeChromaMin(value?: ChromaValues | (string & {}) | number) {
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
        property: "--edge-chroma-min",
        class: "ak-edge-min-c-(--edge-chroma-min)",
      });
    },
    /**
     * Sets the maximum chroma (0-40) of the edge color after all other
     * edge variants have been applied.
     */
    $edgeChromaMax(value?: ChromaValues | (string & {}) | number) {
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
        property: "--edge-chroma-max",
        class: "ak-edge-max-c-(--edge-chroma-max)",
      });
    },
    /**
     * Sets the exact hue of the edge color. Accepts a named hue like
     * `"red"` or `"blue"`, a color harmony like `"complementary"`, or a degree
     * value like `240`.
     */
    $edgeHue(value?: HueValues | (string & {}) | number) {
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
        class: "ak-edge-h-(--edge-hue)",
        style: { "--edge-hue": `${value}` },
      };
    },
  },
});
