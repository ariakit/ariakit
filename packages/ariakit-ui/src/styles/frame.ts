import { cv } from "clava";
import { includes } from "../utils/includes.ts";
import {
  CHROMA_VALUES,
  HUE_VALUES,
  getScaledStyleClass,
  getSpacingValue,
} from "../utils/styles.ts";
import type { ChromaValues, ColorValues, HueValues } from "../utils/styles.ts";
import { layer } from "./layer.ts";

const FRAME_BORDER_COLOR_VALUES = [
  "brand",
  "success",
  "warning",
  "danger",
] as const satisfies readonly ColorValues[];

export type FrameBorderColorValues = (typeof FRAME_BORDER_COLOR_VALUES)[number];

/**
 * Checks whether a value is one of the named colors accepted by the frame's
 * `$borderColor` variant.
 */
export function isFrameBorderColor(
  value: unknown,
): value is FrameBorderColorValues {
  return includes(FRAME_BORDER_COLOR_VALUES, value);
}

export const frame = cv({
  extend: [layer],
  variants: {
    /**
     * Enables the frame system, which allows you to set the element's radius,
     * padding, margin, borders, and concentric-radius layout.
     */
    $frame: "ak-frame",
    /**
     * Stretches the element to fill the parent frame's content box while
     * collapsing shared borders. The element's corners are rounded to match the
     * parent frame's corners based on the parent's `$orientation`. If this
     * isn't inferred automatically, use `$frameStart` and `$frameEnd` to
     * indicate whether the frame is the first or last child in the current
     * flow, which affects how the corners are rounded.
     */
    $cover: "ak-frame-cover",
    /**
     * Sets the frame flow direction. This affects how nested `$cover` frames
     * are rounded.
     */
    $orientation: {
      unset: "",
      horizontal: "ak-frame-row",
      vertical: "ak-frame-col",
    },
    /**
     * Marks the frame as the first child in the current flow, where
     * `$orientation` is determined by the parent frame. This only has an effect
     * when used together with `$cover` and determines how the current frame's
     * corners are rounded. Usually, this doesn't need to be set explicitly if
     * the element is already the first child in the current HTML tree. This is
     * useful when you render another hidden or absolutely positioned element as
     * the first child instead.
     */
    $frameStart: "ak-frame-start",
    /**
     * Marks the frame as the last child in the current flow. This should be
     * used together with `$cover` and determines how the current frame's
     * corners are rounded. Usually, this doesn't need to be set explicitly if
     * the element is already the last child in the current HTML tree. This is
     * useful when you render another hidden or absolutely positioned element as
     * the last child instead.
     */
    $frameEnd: "ak-frame-end",
    /**
     * Sets the default border radius for the element. If the frame is nested,
     * this value will be adjusted to stay concentric with the parent unless
     * `$forceRounded` is used or the parent padding plus the child margin is at
     * least 1rem, in which case the concentric effect is not visually
     * meaningful.
     */
    $rounded: {
      unset: "",
      // A string value, not false: a "false" branch would give frame and
      // every extender an implicit static default, which deadens downstream
      // computed fallbacks like the glider's and the control slot's.
      none: "ak-frame-none",
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
    /**
     * Forces the element to use the `$rounded` value exactly for its radius,
     * regardless of the parent frame context.
     */
    $forceRounded: "ak-frame-force",
    /**
     * Sets the element's frame padding. This affects nested frames' radius
     * calculations unless it's set to `1rem` or more, in which case the
     * concentric effect is no longer visually meaningful.
     */
    $p(value?: "unset" | "none" | (string & {}) | number) {
      if (value == null) return;
      if (value === "unset") return;
      if (value === "none") return "ak-frame-p-0";
      return {
        class: "ak-frame-p-(--frame-padding)",
        style: { "--frame-padding": getSpacingValue(value) },
      };
    },
    /**
     * Sets the element's frame margin. This affects the frame's radius
     * calculations if the current frame is nested, unless the sum of the parent
     * padding and the child margin is at least `1rem`, in which case the
     * concentric effect is no longer visually meaningful.
     */
    $m(value?: "unset" | "none" | (string & {}) | number) {
      if (value == null) return;
      if (value === "unset") return;
      if (value === "none") return "ak-frame-m-0";
      return {
        class: "ak-frame-m-(--frame-margin)",
        style: { "--frame-margin": getSpacingValue(value) },
      };
    },
    /**
     * Sets the border color. By default, it's based on the layer's background
     * color.
     */
    $borderColor: {
      unset: "",
      brand: "ak-edge-brand",
      success: "ak-edge-success",
      warning: "ak-edge-warning",
      danger: "ak-edge-danger",
    } satisfies Record<FrameBorderColorValues | "unset", string>,
    /**
     * Applies the border color exactly as specified, without the default alpha
     * and lightness adjustments.
     */
    $borderRaw: "ak-edge-raw",
    /**
     * Sets the border opacity. Setting it to `adaptive` makes the border appear
     * only in high-contrast mode.
     */
    $borderWeight: {
      unset: "",
      adaptive: "ak-edge-0",
      light: "ak-edge-5",
      normal: "ak-edge-10",
      medium: "ak-edge-20",
      bold: "ak-edge-40",
    },
    /**
     * Uses very dark borders on low-dark layers, typically for native-app-like
     * interfaces with dark surfaces and black or nearly black dividers.
     */
    $borderDark:
      "ak-dark-low:ak-edge-push-[-0.28] ak-dark-low:ak-edge-alpha-[calc((1-l)*(1-l))]",
    /**
     * Specifies how the border is rendered. Setting it to `auto` uses either a
     * border or a ring, depending on the parent layer's lightness.
     */
    $borderType: {
      unset: "",
      auto: "ak-frame-bordering-(--border-width)",
      border: "ak-frame-border-(--border-width)",
      ring: "ak-frame-ring-(--border-width)",
      inset: "ring-(length:--border-width) ring-inset",
      dashed: "ak-frame-border-(--border-width) border-dashed",
      dotted: "ak-frame-border-(--border-width) border-dotted",
    },
    /**
     * Sets the border width. When set to `inherit`, the border uses the parent
     * frame's border or ring width and color. When set to `true`, it defaults
     * to `1px`.
     */
    $border(value?: "inherit" | boolean | number) {
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
    /**
     * Pushes the border lightness away from the current color to create
     * contrast. By default, it's set to `100` (full contrast). Set it to `0`,
     * or use `$borderRaw` (which sets both alpha and lightness), to use the
     * exact lightness of the base border color.
     */
    $borderPush(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--border-push",
        class: "ak-edge-push-(--border-push)",
      });
    },
    /**
     * Lightens the border color by the specified amount (0-100).
     */
    $borderLighten(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--border-lighten",
        class: "ak-edge-lighten-(--border-lighten)",
      });
    },
    /**
     * Darkens the border color by the specified amount (0-100).
     */
    $borderDarken(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--border-darken",
        class: "ak-edge-darken-(--border-darken)",
      });
    },
    /**
     * Sets the minimum lightness (0-100) of the border color after all other
     * border variants have been applied.
     */
    $borderLightnessMin(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--border-lightness-min",
        class: "ak-edge-min-(--border-lightness-min)",
      });
    },
    /**
     * Sets the maximum lightness (0-100) of the border color after all other
     * border variants have been applied.
     */
    $borderLightnessMax(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--border-lightness-max",
        class: "ak-edge-max-(--border-lightness-max)",
      });
    },
    /**
     * Sets the absolute chroma (0-40) of the border color. Higher values mean
     * more saturated colors. Accepts either a named chroma like `"muted"`
     * (`5`), `"balanced"` (`15`), `"vivid"` (`22`), or `"neon"` (`32`), or a
     * numeric value like `40`.
     */
    $borderChroma(value?: ChromaValues | (string & {}) | number) {
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
    /**
     * Increases the border chroma by the specified amount (0-40).
     */
    $borderSaturate(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--border-saturate",
        class: "ak-edge-saturate-(--border-saturate)",
      });
    },
    /**
     * Decreases the border chroma by the specified amount (0-40).
     */
    $borderDesaturate(value?: string | number) {
      return getScaledStyleClass({
        value,
        property: "--border-desaturate",
        class: "ak-edge-desaturate-(--border-desaturate)",
      });
    },
    /**
     * Sets the minimum chroma (0-40) of the border color after all other
     * border variants have been applied.
     */
    $borderChromaMin(value?: ChromaValues | (string & {}) | number) {
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
    /**
     * Sets the maximum chroma (0-40) of the border color after all other
     * border variants have been applied.
     */
    $borderChromaMax(value?: ChromaValues | (string & {}) | number) {
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
    /**
     * Sets the exact hue of the border color. Accepts a named hue like
     * `"red"` or `"blue"`, a color harmony like `"complementary"`, or a degree
     * value like `240`.
     */
    $borderHue(value?: HueValues | (string & {}) | number) {
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
  },
  defaultVariants: {
    $frame: true,
    $borderType(defaultValue, variants) {
      if (variants.$border === "inherit") {
        return "unset";
      }
      // An explicit or component-level $borderType wins; $border alone only
      // implies the adaptive type when nothing else asked for a specific one.
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      if (variants.$border) {
        return "auto";
      }
      return defaultValue;
    },
    $borderColor(defaultValue, variants) {
      if (variants.$border === "inherit") {
        return "unset";
      }
      return defaultValue;
    },
    $borderWeight(defaultValue, variants) {
      if (variants.$border === "inherit") {
        return "unset";
      }
      return defaultValue;
    },
  },
});
