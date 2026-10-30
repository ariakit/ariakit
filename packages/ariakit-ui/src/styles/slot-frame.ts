import { cv } from "clava";
import { hasLayerBackground } from "./layer.ts";
import { textFrame } from "./text-frame.ts";
import { text } from "./text.ts";

/**
 * The `$size` variant of slot frames and control groups. It sets the font size
 * that their padding, gaps, and slots scale with.
 */
export const fontSizeVariants = {
  /**
   * Sets the font size used by padding, gaps, and icons. `auto` inherits the
   * parent font size.
   * @default "auto"
   */
  $size: {
    auto: "",
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  },
};

/**
 * A text frame that lays out slots and text in a row. Its gaps and the margins
 * of the slots inside follow its padding and font size. With `$p="none"`, a
 * slot at an edge starts at that edge, like a list bullet, so it lines up with
 * the text around the frame. It has no interactive state, so controls extend
 * it, and so can static elements, such as field errors.
 */
export const slotFrame = cv({
  extend: [textFrame, text],
  class: [
    "flex",
    // Subtract glyph side bearings from gaps for optical text alignment.
    "[--sidebearing:0.15em]",
    // Reset stacked-card spacing on nested controls' parts while preserving the
    // element's own inherited alignment.
    "*:[--control-inline:initial]",
  ],
  variants: {
    ...fontSizeVariants,
    /**
     * Sets the gap between the element's content and its siblings. With
     * `$p="none"`, `md` is `0.4375em`, and the other steps are a side bearing
     * apart.
     * @default "md"
     */
    $gap: {
      none: "",
      // With padding, sm follows the block padding, and the other steps follow
      // the side padding. Without padding, the slots have no side margins, so
      // the gap alone keeps them apart from the text.
      sm: "[--gap:var(--py)] [&.slot-frame-flush]:[--gap:calc(var(--flush-gap)-var(--sidebearing))] gap-(--gap)",
      // Keep content apart in rows with little side padding.
      md: "[--gap:max(var(--spacing),calc(var(--px)-var(--sidebearing)))] [&.slot-frame-flush]:[--gap:var(--flush-gap)] gap-(--gap)",
      lg: "[--gap:max(var(--spacing),var(--px))] [&.slot-frame-flush]:[--gap:calc(var(--flush-gap)+var(--sidebearing))] gap-(--gap)",
      xl: "[--gap:max(var(--spacing),calc(var(--px)+var(--sidebearing)))] [&.slot-frame-flush]:[--gap:calc(var(--flush-gap)+var(--sidebearing)*2)] gap-(--gap)",
    },
    /**
     * Sets the vertical gap between the element's label and description.
     * @default "auto"
     */
    $gapY: {
      none: "",
      auto: "[--gap-y:calc(var(--gap)/4)] gap-y-(--gap-y)",
    },
  },
  defaultVariants: {
    $size: "auto",
    $gap: "md",
    $gapY: "auto",
  },
  refine({ variants, addClass }) {
    if (variants.$p === "none") {
      // Mark a row without padding, so its slots start at its edges, like list
      // bullets, and its gaps grow from --flush-gap. Field errors read
      // --flush-gap to match the gap of the field above.
      addClass("slot-frame-flush [--flush-gap:0.4375em]");
    }
    // Forced colors remove the fill, which may be the only boundary.
    if (variants.$border != null) return;
    if (!hasLayerBackground(variants)) return;
    addClass("forced-colors:ak-frame-border");
  },
});
