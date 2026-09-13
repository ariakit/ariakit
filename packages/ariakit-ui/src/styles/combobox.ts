import { cv } from "clava";
import { button, buttonSlot } from "./button.ts";
import { control, controlLabel } from "./control.ts";
import { frameBase } from "./frame.ts";
import { input, inputPlaceholder } from "./input.ts";
import {
  option,
  optionContent,
  optionDescription,
  optionLabel,
  optionSlot,
} from "./option.ts";
import { padding } from "./padding.ts";
import { popover } from "./popover.ts";
import { text } from "./text.ts";

export const comboboxInput = cv({
  extend: [input],
  class: "combobox-input shrink-0",
});

export const comboboxLabel = controlLabel;

export const comboboxPopover = cv({
  extend: [popover],
  class: [
    // Focus can land here for a tick before Ariakit hands it back to the
    // combobox control, so the browser's ring stays off. The active item
    // carries the highlight.
    "outline-none overflow-auto overscroll-contain",
    "has-[>.combobox-list]:flex has-[>.combobox-list]:flex-col",
    "max-h-[min(var(--popover-available-height),20rem)]",
    "max-w-(--popover-available-width)",
    "min-w-[min(var(--popover-anchor-width),var(--popover-available-width))]",
    // Native popovers use their invoker as an anchor. Ariakit's positioning
    // uses the style attribute, which takes precedence over these classes.
    "top-[calc(anchor(bottom)+--spacing(1))]",
    "inset-s-[calc(anchor(start)---spacing(1))]",
    "[position-try-fallbacks:flip-block,flip-inline]",
  ],
  defaultVariants: {
    $rounded: "xl",
    $p: 1,
  },
});

export const comboboxList = cv({
  class: [
    "combobox-list min-h-0 overflow-auto overscroll-contain outline-none",
    "[.combobox-input+&]:mt-1",
  ],
});

export const comboboxGroup = cv({
  extend: [frameBase],
  defaultVariants: {
    $cover: true,
  },
});

export const comboboxGroupLabel = cv({
  extend: [padding, text],
  class: "cursor-default text-sm font-medium ak-ink-50",
  defaultVariants: {
    $p: 2,
  },
});

export const comboboxItem = cv({
  extend: [option],
  class: "data-active-item:ak-state-5",
  variants: {
    /** Paints the highlighted appearance for static content. */
    $highlighted: "ak-state-5",
  },
  defaultVariants: {
    $hoverOffset: false,
  },
});

export const comboboxEmpty = cv({
  extend: [control],
  class: "justify-start",
});

export const comboboxItemContent = optionContent;
export const comboboxItemDescription = optionDescription;
export const comboboxItemLabel = optionLabel;
export const comboboxItemSlot = optionSlot;

// A flat select with a layer of its own is a form field, so it takes the finish
// of the input beside it: sunk into the surface, with a real border.
// `$layer="transparent"` keeps the see-through button for a toolbar that owns
// the surface, and the bevel and a colored layer keep their button look.
function isSelectField(variants: { $kind?: unknown; $layer?: unknown }) {
  if (variants.$kind === "bevel") return false;
  return variants.$layer === true;
}

export const comboboxSelect = cv({
  extend: [button],
  // The primitives resolve their computed defaults first, so the field values
  // below replace only the specific defaults they would otherwise produce.
  defaultVariants: {
    $layer(defaultValue, variants) {
      // The bevel paints its own gradient over the see-through button layer.
      if (variants.$kind === "bevel") return defaultValue;
      if (defaultValue !== "transparent") return defaultValue;
      return true;
    },
    $lightnessOffset(defaultValue, variants) {
      if (!isSelectField(variants)) return defaultValue;
      if (defaultValue !== true) return defaultValue;
      // The button lifts a layer of its own. A field sinks instead, like the
      // input: lighter on light layers and darker on dark ones. A disabled
      // field lies flat on the surface around it.
      if (variants.$disabled) return 0;
      return -1;
    },
    $border(defaultValue, variants) {
      if (!isSelectField(variants)) return defaultValue;
      return defaultValue ?? true;
    },
    $borderType(defaultValue, variants) {
      if (!isSelectField(variants)) return defaultValue;
      if (!variants.$border) return defaultValue;
      // A real border rather than the adaptive ring, like the input, so the
      // field keeps the same size on light and dark layers.
      if (defaultValue != null && defaultValue !== "auto") return defaultValue;
      return "border";
    },
    $edgeWeight(defaultValue, variants) {
      if (!isSelectField(variants)) return defaultValue;
      if (!variants.$border) return defaultValue;
      if (defaultValue != null) return defaultValue;
      // The input's weight, which keeps the field boundary at 3:1 against the
      // surface. A disabled field keeps only a faint edge.
      return variants.$disabled ? 10 : 45;
    },
    $rounded(defaultValue, variants) {
      if (!isSelectField(variants)) return defaultValue;
      if (defaultValue !== "md") return defaultValue;
      return "lg";
    },
  },
  refine({ variants, addClass }) {
    if (!isSelectField(variants)) return;
    if (!variants.$border) return;
    if (variants.$borderType !== "border") return;
    // The disabled rules wipe a button's border, and a bordered field with no
    // border at all reads as a rendering glitch on light layers. This channel
    // keeps its edge color instead.
    addClass("[--disabled-border:var(--ak-edge)]");
  },
});

// A slot, so the chevron takes the size and the row alignment every other
// control icon gets. It ends the row even when nothing before it grows.
export const comboboxSelectArrow = cv({
  extend: [buttonSlot],
  class: "ms-auto",
});

export const comboboxSelectLabel = controlLabel;

export const comboboxSelectPlaceholder = inputPlaceholder;

// The mark keeps its space when unselected so item labels stay aligned.
export const comboboxItemCheck = cv({
  extend: [optionSlot],
  class: "pointer-events-none [&:empty]:invisible",
});
