import { cv } from "clava";
import { button, buttonDescription, buttonLabel } from "./button.ts";

export const radio = cv({
  extend: [button],
  class: [
    "[&_input]:sr-only",
    // Focus lands on the visually hidden input, so the ring must come from
    // the -within variant, like the checkbox card's.
    "ui-focus-visible-within:outline-2",
    // The indicator dot is a bordered circle drawn with a ::before element,
    // centered on the text row like the legacy items-center button layout.
    "before:content-[''] before:size-[1em] before:flex-none",
    "before:self-center before:rounded-full before:border-2",
    "before:border-current before:bg-clip-content before:p-0.5",
    "before:ak-ink-50",
    // Checked fills the center pad with the current color. The legacy fill
    // used bg-current, which ak-text silently kills with an !important
    // transparent background-color, so the fill is a currentColor gradient
    // image instead, clipped to the content box by bg-clip-content.
    "ui-checked-within:before:ak-text",
    "ui-checked-within:before:bg-linear-to-b",
    "ui-checked-within:before:from-current ui-checked-within:before:to-current",
    // Disabled checked dots stay filled but grey out with the label ink
    // instead of keeping the brand color.
    "not-ui-disabled-within:ui-checked-within:before:ak-text-brand",
    // The ghost layer's bg-transparent would also suppress the hover state
    // paint; radios have no hover glider, so restore the layer color while
    // hovered like the legacy ak-radio_hover does. Skipped when disabled so
    // gradient or image parents don't get a flat rectangle painted on top.
    "not-ui-disabled-within:ui-hover:bg-(--ak-layer)",
  ],
  defaultVariants: {
    // Radios sit flat on the surrounding layer like the legacy ak-radio
    // (a bare ak-button_idle): no painted background until hovered, and the
    // dot inks compute against the parent layer.
    $layer: "ghost",
  },
});

export const radioLabel = buttonLabel;

export const radioDescription = buttonDescription;
