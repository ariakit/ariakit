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

export const comboboxInput = input;

export const comboboxLabel = controlLabel;

export const comboboxList = cv({
  // The list can receive focus before it returns to the input. The active
  // option provides the highlight during this transfer.
  class: "outline-none",
});

export const comboboxPopover = cv({
  extend: [popover],
  class: [
    // Focus can land here for a tick before Ariakit hands it back to the
    // combobox control, so the browser's ring stays off. The active item
    // carries the highlight.
    "outline-none overflow-auto overscroll-contain",
    "max-h-[min(var(--popover-available-height),20rem)]",
    "max-w-(--popover-available-width)",
    "min-w-[min(var(--popover-anchor-width),var(--popover-available-width))]",
  ],
  defaultVariants: {
    $rounded: "xl",
    $p: 1,
  },
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
// of the input beside it: a writing surface with an inset edge.
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
      // Like the input, a field keeps a light writing surface on light layers
      // and a dark one on dark layers. A disabled field uses the surrounding
      // surface.
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
      // Like the input, an inset edge keeps the control's intrinsic height on
      // light and dark layers.
      if (defaultValue != null && defaultValue !== "auto") return defaultValue;
      return "inset";
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
    if (variants.$borderType !== "border" && variants.$borderType !== "inset") {
      return;
    }
    // The disabled rules wipe a button's border, and a bordered field with no
    // border at all reads as a rendering glitch on light layers. This channel
    // keeps its edge color instead.
    addClass("[--disabled-border:var(--ak-edge)]");
    if (variants.$borderType !== "inset") return;
    // Forced colors remove the shadow that paints the inset edge.
    addClass(
      "forced-colors:outline-(length:--border-width) forced-colors:-outline-offset-1",
    );
  },
});

// A slot, so the chevron takes the size and the row alignment every other
// control icon gets. It ends the row even when nothing before it grows.
export const comboboxSelectArrow = cv({
  extend: [buttonSlot],
  class: "ms-auto",
});

export const comboboxSelectIcon = buttonSlot;

export const comboboxSelectLabel = controlLabel;

export const comboboxSelectPlaceholder = inputPlaceholder;

// The display value takes the label cv so the button's $text* variants reach
// it: they only match .text and svg descendants. It fills the row and reads
// from the start, where the button would center it.
export const comboboxSelectValueLabel = cv({
  extend: [controlLabel],
  class: "flex-1 text-start",
});

// The same list surface as the combobox popover, so a long select scrolls and a
// wide button opens a list at least as wide as itself.
export const comboboxSelectPopover = cv({
  extend: [comboboxPopover],
  class: [
    // Anchor positioning for a native [popover] opened by its invoker.
    // Ariakit positions through the style attribute, which wins over these.
    "top-[calc(anchor(bottom)+--spacing(1))]",
    "inset-s-[calc(anchor(start)---spacing(1))]",
    "[position-try-fallbacks:flip-block,flip-inline]",
  ],
});

export const comboboxSelectItem = cv({
  extend: [option],
  class: "group/select-item",
  defaultVariants: {
    // The check sits closer to its label than a button's slot does.
    $gap: "sm",
  },
});

// The check keeps its space while unselected, so the labels line up.
export const comboboxSelectItemCheck = cv({
  extend: [buttonSlot],
  class: "invisible group-ui-selected/select-item:visible",
});
