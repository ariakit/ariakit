import { cv } from "clava";
import { includes } from "../utils/includes.ts";
import { getSpacingValue } from "../utils/styles.ts";
import { edge } from "./edge.ts";

const ROUNDED_VALUES = [
  "none",
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "full",
] as const;

export type FrameRoundedValue = (typeof ROUNDED_VALUES)[number] | "unset";

/**
 * Resolves named radii and CSS lengths or expressions. Extenders that replace
 * `$rounded` must call this for values they do not handle.
 */
export function getFrameRoundedClass(
  value?: FrameRoundedValue | (string & {}),
) {
  if (value == null) return;
  // Use "unset" to avoid an implicit false default that would prevent
  // downstream computed fallbacks.
  if (value === "unset") return;
  if (includes(ROUNDED_VALUES, value)) {
    const valueMap = {
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
    } satisfies Record<Exclude<FrameRoundedValue, "unset">, string>;
    return valueMap[value];
  }
  // Ignore unknown named steps; accept lengths, percentages, and expressions.
  if (!/[(.\d%]/.test(value)) return;
  return {
    class: "ak-frame-(--frame-radius)",
    style: { "--frame-radius": value },
  };
}

/**
 * Frame geometry and concentric corners without a background layer. Use `frame`
 * when the element also needs layer and edge colors.
 */
export const frameBase = cv({
  variants: {
    /**
     * Enables the frame system, which allows you to set the element's radius,
     * padding, margin, borders, and concentric-radius layout.
     */
    $frame: "ak-frame",
    /**
     * Fills the parent frame's content box, collapses shared borders, and
     * matches its corners. The parent's `$orientation` controls rounding. Use
     * `$frameStart` and `$frameEnd` when DOM order does not identify the outer
     * corners.
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
     * Marks the first `$cover` frame in the parent's flow for corner rounding.
     * Use when another DOM child precedes the first visible frame.
     */
    $frameStart: "ak-frame-start",
    /**
     * Marks the last `$cover` frame in the parent's flow for corner rounding.
     * Use when another DOM child follows the last visible frame.
     */
    $frameEnd: "ak-frame-end",
    /**
     * Sets the radius from a named step, CSS length, or expression. Nested
     * frames stay concentric unless `$forceRounded` is set or parent padding
     * plus child margin reaches `1rem`.
     */
    $rounded(value?: FrameRoundedValue | (string & {})) {
      return getFrameRoundedClass(value);
    },
    /**
     * Forces the element to use the `$rounded` value exactly for its radius,
     * regardless of the parent frame context.
     */
    $forceRounded: "ak-frame-force",
    /**
     * Sets frame padding. Values below `1rem` affect nested corner rounding.
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
     * Sets frame margin. Nested corner rounding applies while parent padding
     * plus this margin is below `1rem`.
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
     * Specifies how the border is rendered. Setting it to `auto` uses either a
     * border or a ring, depending on the parent layer's lightness.
     */
    $borderType: {
      unset: "",
      auto: "ak-frame-bordering-(--border-width)",
      border: "ak-frame-border-(--border-width)",
      ring: "ak-frame-ring-(--border-width)",
      // Inset shadows disappear in forced colors; use a real border with the
      // requested width and geometry.
      inset:
        "ring-(length:--border-width) ring-inset forced-colors:ak-frame-border-(--border-width)",
      dashed: "ak-frame-border-(--border-width) border-dashed",
      dotted: "ak-frame-border-(--border-width) border-dotted",
    },
    /**
     * Sets the border width in pixels. `true` uses `1px`; `inherit` uses the
     * parent frame's width and color. `false` removes the border even with an
     * inherited width or explicit `$borderType`.
     */
    $border(value?: "inherit" | boolean | number) {
      if (value == null) return;
      // Reset inherited width so $borderType and descendants cannot restore an
      // ancestor's border.
      if (value === false) {
        return { style: { "--border-width": "0px" } };
      }
      if (value === "inherit") {
        return "ak-frame-bordering-inherit ak-edge-inherit";
      }
      if (value === true) {
        value = 1;
      }
      return { style: { "--border-width": `${value}px` } };
    },
  },
  defaultVariants: {
    $frame: true,
    $borderType(defaultValue, variants) {
      if (variants.$border === "inherit") {
        return "unset";
      }
      // Remove zero-width shadows too; Firefox can render them as faint corner
      // arcs.
      if (variants.$border === false) {
        return "unset";
      }
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      if (variants.$border) {
        return "auto";
      }
      return defaultValue;
    },
  },
});

/** Frame geometry with a layer and adaptive edge colors. */
export const frame = cv({
  extend: [edge, frameBase],
  defaultVariants: {
    // Provide text and edge colors without painting over gliders or other
    // content. Use $layer: true or a color for a resting surface.
    $layer: "transparent",
    // These defaults must live here: edge's computed defaults cannot read
    // frame's $border variant.
    $edge(defaultValue, variants) {
      if (variants.$border === "inherit") {
        return "unset";
      }
      return defaultValue;
    },
    $edgeWeight(defaultValue, variants) {
      if (variants.$border === "inherit") {
        return "unset";
      }
      return defaultValue;
    },
  },
});
