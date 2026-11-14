import { cv } from "clava";
import { text } from "./text.ts";

/**
 * Heading typography with element-based sizes. It has no margins, so the parent
 * sets the space around it.
 */
export const heading = cv({
  extend: [text],
  class: [
    "font-medium",
    // Larger text needs less space between lines and letters. These values read
    // the final font size, so $level needs no extra rule.
    // Preserve list-item line height. Zero specificity permits overrides;
    // direct properties keep the leading and letter spacing fallbacks of text-*
    // classes.
    "not-[li_*]:ui-base:[line-height:round(calc(1em+0.25rem),1px)]",
    "ui-base:[letter-spacing:calc(0.025rem-0.036em)]",
    // The balance shorthand would also reset the wrap mode, and a heading in a
    // nowrap parent would then wrap.
    "ui-base:[text-wrap-style:balance]",
    "[--heading-size-1:2.25em] [--heading-size-2:1.75em]",
    "[--heading-size-3:1.4em] [--heading-size-4:1.2em] [--heading-size-5:1em]",
    // Size h1–h5 by element; other elements inherit. Zero specificity lets
    // caller text-* classes override these steps.
    "[h1]:ui-base:text-(length:--heading-size-1)",
    "[h2]:ui-base:text-(length:--heading-size-2)",
    "[h3]:ui-base:text-(length:--heading-size-3)",
    "[h4]:ui-base:text-(length:--heading-size-4)",
    "[h5]:ui-base:text-(length:--heading-size-5)",
    // Permalink colors and decoration widths need ! to override Link's compound
    // state selectors.
    "[&_a]:font-[weight:inherit] [&_a]:text-current! [&_a]:no-underline",
    "[&_a]:hover:underline [&_a]:hover:decoration-1!",
    "[&_a]:hover:underline-offset-[0.25em]",
  ],
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
  class: "heading-description ak-ink-70",
});
