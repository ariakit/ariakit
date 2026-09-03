import { cv } from "clava";
import { button, buttonDescription, buttonLabel } from "./button.ts";
import { focusWithin } from "./focus.ts";

export const radio = cv({
  // Focus lands on the input inside the label, so the ring comes from the
  // -within trigger.
  extend: [button, focusWithin],
  class: [
    "[&_input]:sr-only",
    // A radio is a text row, not a button: the dot and the label start at
    // the edge instead of centering in the row.
    "justify-start",
    // The dot is a bordered circle drawn by ::before. The padding is the gap
    // between the ring and the fill, which bg-clip-content keeps clear.
    "before:size-4 before:flex-none before:self-center",
    "before:rounded-full before:border-2 before:border-current",
    "before:p-0.5 before:bg-clip-content",
    "before:ak-ink-50",
    // Only the input carries the checked and disabled state, never the label
    // around it, so the dot's own states come from the -within variants.
    // ak-text forces an !important transparent background-color, which a
    // plain background in currentColor never gets past, so the fill is a
    // gradient image in that color instead.
    "ui-checked-within:before:ak-text",
    "ui-checked-within:before:bg-linear-to-b",
    "ui-checked-within:before:from-current ui-checked-within:before:to-current",
    // A disabled radio keeps its dot, in the ink's grey rather than the brand.
    "not-ui-disabled-within:ui-checked-within:before:ak-text-brand",
  ],
});

export const radioLabel = buttonLabel;

export const radioDescription = buttonDescription;
