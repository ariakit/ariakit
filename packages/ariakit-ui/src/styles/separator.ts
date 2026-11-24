import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { edge } from "./edge.ts";

/** A section divider with adaptive edge color and prose spacing. */
export const separator = cv({
  extend: [edge],
  class: "ui-separator",
  variants: {
    /** Sets the divider line style. */
    $line: {
      solid: "border-solid",
      dashed: "border-dashed",
      dotted: "border-dotted",
    },
    /**
     * Adds space above and below the divider. Numbers scale the spacing token.
     * Defaults to half the surrounding column gap; `0` uses only the column
     * gap.
     */
    $gap(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--separator-gap": getSpacingValue(value) },
      };
    },
  },
  defaultVariants: {
    // Resolve the edge against the surrounding surface without painting a
    // layer.
    $layer: "transparent",
    $edgeWeight: "medium",
    $line: "dashed",
  },
});
