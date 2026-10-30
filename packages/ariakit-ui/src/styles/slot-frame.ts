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

// Gaps in a row with padding follow its padding: sm the block padding, the
// other steps the side padding.
const PADDED_GAPS = {
  sm: "[--gap:var(--py)] gap-(--gap)",
  // Keep content apart in rows with little side padding.
  md: "[--gap:max(var(--spacing),calc(var(--px)-var(--sidebearing)))] gap-(--gap)",
  lg: "[--gap:max(var(--spacing),var(--px))] gap-(--gap)",
  xl: "[--gap:max(var(--spacing),calc(var(--px)+var(--sidebearing)))] gap-(--gap)",
};

// Without padding, the slots have no side margins, so the gap alone keeps them
// apart from the text. md is the gap after the icon of a field error, and the
// other steps are a side bearing apart, like md, lg, and xl with padding.
const FLUSH_GAPS = {
  sm: "[--gap:calc(0.375em-var(--sidebearing))] gap-(--gap)",
  md: "[--gap:0.375em] gap-(--gap)",
  lg: "[--gap:calc(0.375em+var(--sidebearing))] gap-(--gap)",
  xl: "[--gap:calc(0.375em+var(--sidebearing)*2)] gap-(--gap)",
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
     * `$p="none"`, `md` is `0.375em`, and the other steps are a side bearing
     * apart.
     * @default "md"
     */
    $gap: {
      none: "",
      // The refine picks each gap for the padding.
      sm: "",
      md: "",
      lg: "",
      xl: "",
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
    const padded = variants.$p !== "none";
    if (!padded) {
      // A slot moves into the side padding by its distance from the top, so it
      // sits as far from the side as from the top. Without padding, that
      // distance would be a side margin that no edge shows. A control inside
      // the slot moves its own slots again, like in a text slot.
      addClass(
        "[&>.control-slot]:[--slot-pull:0] [&>.control-slot>*]:[--slot-pull:initial]",
      );
    }
    // Extenders can add their own gap keys, such as auto.
    const gap = variants.$gap;
    if (gap && gap !== "none" && Object.hasOwn(PADDED_GAPS, gap)) {
      addClass(padded ? PADDED_GAPS[gap] : FLUSH_GAPS[gap]);
    }
    // Forced colors remove the fill, which may be the only boundary.
    if (variants.$border != null) return;
    if (!hasLayerBackground(variants)) return;
    addClass("forced-colors:ak-frame-border");
  },
});
