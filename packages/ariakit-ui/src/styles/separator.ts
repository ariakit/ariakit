import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { edge } from "./edge.ts";

// A rule between sections.
export const separator = cv({
  extend: [edge],
  class: [
    // An hr already carries a one-pixel block-start border from the browser
    // reset, so this restates the width for any other element given the rule.
    "border-bs my-(--separator-gap)",
    // Half the rhythm of the column around it, so the rule reads as a break
    // rather than another sibling. The fallback keeps it spaced outside one.
    "[--separator-gap:calc(var(--prose-gap,--spacing(5))*0.5)]",
    // The element after the rule drops its own top margin, which the rule's
    // margins already account for. The not-first is redundant after a sibling
    // combinator and is there only to lift the specificity above the plain
    // flow margin a heading sets, so the two never depend on rule order.
    "[&+*]:not-first:mt-0",
  ],
  variants: {
    /**
     * Sets how the rule is drawn.
     */
    $line: {
      solid: "border-solid",
      dashed: "border-dashed",
      dotted: "border-dotted",
    },
    /**
     * Sets the extra space on each side of the rule, on top of the gap of the
     * column it sits in. Numbers scale the spacing token. Left unset, the rule
     * adds half the rhythm of the column, so it sits one and a half rhythms
     * from each neighbor; `0` puts it at the column rhythm like a sibling.
     */
    $gap(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--separator-gap": getSpacingValue(value) },
      };
    },
  },
  defaultVariants: {
    // The layer is here to give the edge color a surface to resolve against,
    // not to paint one.
    $layer: "transparent",
    $edgeWeight: "medium",
    $line: "dashed",
  },
});
