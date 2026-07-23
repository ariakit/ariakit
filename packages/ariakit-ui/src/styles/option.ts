import { cv } from "clava";
import { active } from "./active.ts";
import { control } from "./control.ts";
import { hover } from "./hover.ts";

export const option = cv({
  extend: [control, hover, active],
  class: [
    // Options are commands, not text: no text cursor or selection, and the
    // pointer shows through when the option lives inside a link.
    "not-[a]:cursor-default not-[button]:select-none",
    "[&:where(a_&)]:not-ui-disabled:cursor-pointer",
    // Options are text rows, not buttons: align content to the start
    // instead of the control's centered default.
    "justify-start",
    // Composite focus highlights the item with the brand layer instead of
    // drawing a ring; the contrast modifier keeps the text readable on it.
    "ui-focus-visible:ak-layer-brand",
    "ui-focus-visible:ak-layer-contrast",
    "ui-focus-visible:outline-none",
    // Options soften when disabled instead of using the stronger control
    // disabled treatment, like the legacy ak-option_disabled.
    "ui-disabled:ak-ink-50 ui-disabled:ak-layer-mix-20",
  ],
  defaultVariants: {
    $rounded: "lg",
    // One step over the $hoverOffset default, matching legacy ak-option's
    // ak-state-6 hover.
    $hoverOffset: 1.2,
    $active: true,
    $gapY: "none",
  },
  refine({ variants, setVariants }) {
    if (!variants.$disabled) return;
    // Options normally signal disabled through aria-disabled, which the
    // ui-* variants handle; when the prop is used instead, drop the state
    // feedback like the button does.
    setVariants({
      $hoverOffset: false,
      $hoverPush: false,
      $hoverLighten: false,
      $hoverDarken: false,
      $hoverSaturate: false,
      $hoverDesaturate: false,
      $active: false,
    });
  },
});
