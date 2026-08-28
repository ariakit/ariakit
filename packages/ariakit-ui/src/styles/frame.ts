import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { edge } from "./edge.ts";

export const frame = cv({
  extend: [edge],
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
    // These two clear variants declared by `edge`. They belong here because a
    // computed default only sees the variants its own component declares or
    // extends, so in `edge` they could not read $border.
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
