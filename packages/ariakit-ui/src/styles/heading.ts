import { cv } from "clava";
import { text } from "./text.ts";

/**
 * Heading typography with element-based sizes. It has no margins, so the parent
 * sets the space around it.
 */
export const heading = cv({
  extend: [text],
  class: "ui-heading",
  variants: {
    /**
     * Sets visual size independently of the heading element. Otherwise, h1–h5
     * use their own steps. Use a text-* class for sizes outside this scale.
     */
    $level(value?: "auto" | 1 | 2 | 3 | 4 | 5) {
      if (!value) return;
      if (value === "auto") return;
      // Inline size overrides the element-based rule regardless of stylesheet
      // order.
      return { style: { fontSize: `var(--heading-size-${value})` } };
    },
    /**
     * Disables the inherited variant, which the heading line height outside
     * list items would override. A `leading-*` class still sets the line
     * height.
     */
    $leading: null,
  },
  defaultVariants: {
    // Full strength, also inside a parent with weaker ink.
    $ink: 100,
  },
});

/**
 * Muted text under a heading. It keeps the font size of its parent. As a direct
 * child of `prose`, it sits closer to the heading before it.
 */
export const headingDescription = cv({
  class: "ui-heading-description ak-ink-70",
});
