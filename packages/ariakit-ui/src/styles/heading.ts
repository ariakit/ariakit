import { cv } from "clava";
import { text } from "./text.ts";

/** Heading typography with element-based sizes and flow spacing. */
export const heading = cv({
  extend: [text],
  class: [
    "ak-ink-100 font-medium",
    // Preserve list-item line height. Zero specificity permits overrides;
    // direct line-height keeps text-* leading fallbacks.
    "[:where(&:not(li_*))]:[line-height:1.25]",
    "[--heading-size-1:2.25em] [--heading-size-2:1.75em]",
    "[--heading-size-3:1.4em] [--heading-size-4:1.2em] [--heading-size-5:1em]",
    // Size h1–h5 by element; other elements inherit. Zero specificity lets
    // caller text-* classes override these steps.
    "[:where(&:is(h1))]:text-(length:--heading-size-1)",
    "[:where(&:is(h2))]:text-(length:--heading-size-2)",
    "[:where(&:is(h3))]:text-(length:--heading-size-3)",
    "[:where(&:is(h4))]:text-(length:--heading-size-4)",
    "[:where(&:is(h5))]:text-(length:--heading-size-5)",
    // Channel utilities sort before literal margins so caller mt-* and mb-*
    // classes win.
    "mt-(--heading-mt) mb-(--heading-mb)",
    "[--heading-mt:--spacing(4)] [--heading-mb:--spacing(2)]",
    "first:[--heading-mt:0px] last:[--heading-mb:0px]",
    // Use one smaller margin between adjacent headings, including layouts where
    // margins do not collapse.
    "[&:has(+:is(h1,h2,h3,h4,h5,h6))]:[--heading-mb:0px]",
    "[:is(h1,h2,h3,h4,h5,h6)+&]:[--heading-mt:0.35em]",
    // Let the list item control spacing after its heading.
    "in-[li]:[--heading-mb:0px]",
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
  },
});
