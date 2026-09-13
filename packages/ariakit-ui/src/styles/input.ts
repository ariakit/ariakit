import { cv } from "clava";
import { control, controlSlot } from "./control.ts";
import { focusHighlight } from "./focus.ts";

export const input = cv({
  extend: [control, focusHighlight],
  class: [
    "max-w-full cursor-text items-center justify-start",
    // Keep the danger color's lightness and set its weight after the ordinary
    // edge utilities, which otherwise push it to black or white.
    "not-ui-field-disabled:ui-field-invalid:ak-edge-danger not-ui-field-disabled:ui-field-invalid:ak-edge-45",
    "not-ui-field-disabled:ui-field-invalid:ak-edge-push-0",
    // Only animate into the hover state; snapping back on hover-out keeps
    // the field from feeling laggy.
    "hover:transition-[background-color]",
    // Plain hover, not ui-hover: fields are not command-like, and ui-hover's
    // nested-interactive exclusion would suppress feedback on a wrapper
    // whose form holds the input next to a submit button. The disabled
    // exclusion it builds in has to be spelled out in exchange, with the
    // same condition as the disabled look below.
    "not-ui-field-disabled:hover:ak-state-2.5",
    // A script can flip the disabled state after render, and a wrapper takes
    // the state from the entry controls inside it, so the disabled look is a
    // CSS rule rather than a variant. ui-field-disabled leaves a wrapper enabled
    // while any control in it still takes entry, and when only a button in it
    // is disabled, such as a send button that waits for text. The field lies
    // flat on the surface with a faint edge and the dimmed ink of every other
    // disabled control. $lightnessOffset lands in the style attribute, which
    // no class can gate, so the plugin's own zero offset cancels the sink.
    "ui-field-disabled:cursor-not-allowed **:ui-disabled:cursor-not-allowed",
    "ui-field-disabled:ak-ink-0 ui-field-disabled:**:ak-ink-0",
    "ui-field-disabled:ak-edge-10",
    "ui-field-disabled:ak-layer-offset-0",
    // Native inputs and wrappers use the same line box as other controls.
    // A textarea keeps its row-based height.
    "[input]:box-content [input]:h-lh",
    "[&_input]:box-content [&_input]:h-lh",
    "[&_input]:outline-none",
    // Forced colors remove shadows, including the inset edge.
    "forced-colors:outline-(length:--border-width) forced-colors:-outline-offset-1",
    "placeholder:ak-ink-0 [&_input]:placeholder:ak-ink-0",
  ],
  variants: {
    /**
     * Whether to show a focus ring when the field, or the input inside it,
     * takes focus, and how thick the ring should be.
     */
    $focus(value?: 1 | 2 | 3 | boolean) {
      if (!value) return;
      // A function replaces the inherited scale instead of emitting beside it.
      // focus-within, because the class often sits on a wrapper around the real
      // input, and plain focus rather than focus-visible, so a field built from
      // a button or a wrapper rings on a pointer too.
      if (value === 1) return "focus-within:outline";
      if (value === 3) return "focus-within:outline-3";
      return "focus-within:outline-2";
    },
    /**
     * Extends the focus ring offsets with `inset`, which tucks the ring inside
     * the border so the two read as a single edge.
     */
    $focusOffset: {
      inset: "-outline-offset-1",
    },
  },
  defaultVariants: {
    $rounded: "lg",
    $border: true,
    // An inset edge preserves the control's intrinsic height in both themes.
    $borderType: "inset",
    // A field's edge is its only boundary on the surface around it, so it is
    // stronger than the named border weights provide: the lightest that keeps
    // it at 3:1 against a light or a dark canvas. choice.ts draws its box at
    // the same weight. A variant default, not a base class, so instance weights
    // replace it instead of losing by stylesheet order.
    $edgeWeight: 45,
    // Fields keep a light writing surface on light layers and a dark one on
    // dark layers. Hover pulls the field toward the surrounding surface.
    $lightnessOffset: -1,
    $focus: true,
    $focusOffset: "inset",
  },
});

export const inputSlot = controlSlot;

/**
 * Placeholder-colored text for fake input fields, like a button styled as an
 * input showing its empty-state label.
 */
export const inputPlaceholder = cv({
  class: "ak-ink-0",
});
