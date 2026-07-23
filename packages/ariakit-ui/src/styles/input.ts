import { cv } from "clava";
import { frame } from "./frame.ts";
import { text } from "./text.ts";

export const input = cv({
  extend: [frame, text],
  class: [
    "max-w-full cursor-text leading-[1em]",
    // The focus ring is nudged inside the border so the two read as a
    // single edge, and it responds to focus-within because the class often
    // sits on a wrapper around the actual input.
    "ak-outline ak-outline-brand -outline-offset-1 focus-within:outline-2",
    // Fields sit slightly raised on light layers and slightly recessed on
    // dark ones, where hover and focus restore the base layer instead of
    // shifting it further. Plain not-hover, not the ui-hover idiom: a
    // multi-rule custom variant can't be negated, so not-ui-hover never
    // compiles. Disabled fields keep the recessed layer regardless.
    "ak-light:ak-layer-lighten-6",
    "ak-dark:not-hover:not-focus-within:ak-layer-darken-3",
    "ak-dark:ui-disabled-within:not-focus-within:ak-layer-darken-3",
    // Only transition into the hover state; snapping back on hover-out
    // keeps the field from feeling laggy, like the legacy ak-input. Plain
    // hover, not ui-hover: fields are not command-like, and ui-hover's
    // nested-interactive exclusion would suppress feedback on wrappers
    // whose form holds the input next to a submit button.
    "hover:transition-[background-color]",
    "ak-light:hover:ak-state-3",
    // Normalize text metrics whether the class sits on the input itself or
    // on a wrapper element with the input inside.
    "[&:is(input)]:box-content [&:is(input)]:h-[1em]",
    "[&_input]:-my-[0.25em] [&_input]:box-content [&_input]:h-[1.5em]",
    "[&_input]:outline-none",
    "placeholder:ak-ink-0 [&_input]:placeholder:ak-ink-0",
  ],
  defaultVariants: {
    $rounded: "lg",
    $p: 3,
    $border: true,
    // Always a real border like the legacy ak-frame-border, so the field
    // geometry doesn't change between light and dark themes.
    $borderType: "border",
    // Inputs want a stronger edge than the named border weights provide
    // (between medium and bold). A variant default, not a base class, so
    // instance weights replace it instead of losing by stylesheet order.
    $borderWeight: 30,
  },
});

/**
 * Placeholder-colored text for fake input fields, like a button styled as an
 * input showing its empty-state label.
 */
export const inputPlaceholder = cv({
  class: "ak-ink-0",
});
