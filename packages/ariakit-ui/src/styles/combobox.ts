import { cv } from "clava";
import { button, buttonSlot } from "./button.ts";
import {
  control,
  controlField,
  controlFieldContent,
  controlFieldDescription,
  controlFieldError,
  controlFieldErrorIcon,
  controlFieldLabel,
} from "./control.ts";
import { frameBase } from "./frame.ts";
import {
  getInputEdgeRaw,
  input,
  inputInvalidEdge,
  inputPlaceholder,
} from "./input.ts";
import {
  option,
  optionContent,
  optionDescription,
  optionLabel,
  optionSlot,
} from "./option.ts";
import { popover } from "./popover.ts";
import { textFrame } from "./text-frame.ts";
import { text } from "./text.ts";

/** A combobox input that does not shrink in a flex layout. */
export const comboboxInput = cv({
  extend: [input],
  class: "combobox-input shrink-0",
});

/**
 * A field that lays out a combobox label, its control, and the control's texts.
 */
export const comboboxField = controlField;

/**
 * Holds a combobox and its texts in the second column of a horizontal field.
 */
export const comboboxFieldContent = controlFieldContent;

/** Combobox label text with optional truncation. */
export const comboboxLabel = controlFieldLabel;

/** Hint text for a combobox or select. */
export const comboboxDescription = controlFieldDescription;

/**
 * Error text for a combobox or select. Put a `comboboxErrorIcon` part first to
 * mark it with an icon.
 */
export const comboboxError = controlFieldError;

/**
 * An icon at the start of the first line of a combobox or select error. Put it
 * first in the error, and hide it from assistive technology.
 */
export const comboboxErrorIcon = controlFieldErrorIcon;

/** A scrollable combobox popup constrained to its available space. */
export const comboboxPopover = cv({
  extend: [popover],
  class: [
    // Suppress the temporary popup focus ring; the active item carries the
    // highlight.
    "outline-none overflow-auto overscroll-contain",
    "has-[>.combobox-list]:flex has-[>.combobox-list]:flex-col",
    "max-h-[min(var(--popover-available-height),20rem)]",
    "max-w-(--popover-available-width)",
    "min-w-[min(var(--popover-anchor-width),var(--popover-available-width))]",
    // Use native invoker anchors unless Ariakit supplies inline positioning.
    "top-[calc(anchor(bottom)+--spacing(1))]",
    "inset-s-[calc(anchor(start)---spacing(1))]",
    "[position-try-fallbacks:flip-block,flip-inline]",
  ],
  defaultVariants: {
    $rounded: "xl",
    $p: 1,
  },
});

/** A scrollable list of combobox options. */
export const comboboxList = cv({
  class: [
    "combobox-list min-h-0 overflow-auto overscroll-contain outline-none",
    "[.combobox-input+&]:mt-1",
  ],
});

/** A group of combobox options that covers the parent frame. */
export const comboboxGroup = cv({
  extend: [frameBase],
  defaultVariants: {
    $cover: true,
  },
});

/** A compact, muted label for a group of combobox options. */
export const comboboxGroupLabel = cv({
  extend: [textFrame, text],
  class: "cursor-default text-sm font-medium ak-ink-50",
  defaultVariants: {
    $p: 2,
  },
});

/** A combobox option with focus and forced-colors highlights. */
export const comboboxItem = cv({
  extend: [option],
  class: [
    // Follow current focus. The active item keeps data-active-item after focus
    // leaves the combobox, so that attribute would leave a stale highlight.
    "ui-focus:ak-state-5",
    // Use system selection colors without browser canvas backplates. Every
    // descendant needs HighlightText after automatic color adjustment is
    // disabled. The important flag keeps the selection text color of the option
    // over its hover ink, because the pointer also gives focus to the option.
    "ui-focus:forced-colors:forced-color-adjust-none",
    "ui-focus:forced-colors:bg-[Highlight]",
    "ui-focus:forced-colors:text-[HighlightText]!",
    "ui-focus:forced-colors:**:text-[HighlightText]",
    // A disabled option can still have focus. The extra state selector lets the
    // selection text color override the system disabled color.
    "ui-focus:ui-disabled:forced-colors:text-[HighlightText]!",
    "ui-focus:ui-disabled:forced-colors:**:text-[HighlightText]!",
  ],
  variants: {
    /** Paints the highlighted appearance for static content. */
    $highlighted: [
      "ak-state-5",
      "forced-colors:forced-color-adjust-none",
      "forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]",
      "forced-colors:**:text-[HighlightText]",
    ],
  },
  defaultVariants: {
    $hoverOffset: false,
  },
});

/** An empty-state message on the combobox popup's surface. */
export const comboboxEmpty = cv({
  extend: [control],
  class: "justify-start",
  defaultVariants: {
    $layer: "transparent",
  },
});

/** A flexible wrapper for a combobox item's label and description. */
export const comboboxItemContent = optionContent;
/** Secondary combobox item text that truncates by default. */
export const comboboxItemDescription = optionDescription;
/** Combobox item label text that truncates by default. */
export const comboboxItemLabel = optionLabel;
/** A text-aligned slot for combobox item icons and other content. */
export const comboboxItemSlot = optionSlot;

// Neutral flat selects use input styling. Transparent, colored, and beveled
// selects keep button styling.
function isSelectField(variants: { $kind?: unknown; $layer?: unknown }) {
  if (variants.$kind === "bevel") return false;
  return variants.$layer === true;
}

/** A select trigger with input styling unless it uses a button surface. */
export const comboboxSelect = cv({
  extend: [button],
  // Replace only the primitives' computed defaults.
  defaultVariants: {
    $layer(defaultValue, variants) {
      if (variants.$kind === "bevel") return defaultValue;
      if (defaultValue !== "transparent") return defaultValue;
      return true;
    },
    $lightnessOffset(defaultValue, variants) {
      if (!isSelectField(variants)) return defaultValue;
      if (defaultValue !== true) return defaultValue;
      // Input surfaces use $lighten; disabled fields return to the surrounding
      // surface.
      if (variants.$disabled) return 0;
      return false;
    },
    $lighten(defaultValue, variants) {
      if (!isSelectField(variants)) return defaultValue;
      if (variants.$disabled) return defaultValue;
      // Match the raised input surface.
      return defaultValue ?? true;
    },
    $chromaMax(defaultValue, variants) {
      if (!isSelectField(variants)) return defaultValue;
      if (variants.$disabled) return defaultValue;
      // Match the input's white surface on tinted light layers.
      return defaultValue ?? "auto";
    },
    $border(defaultValue, variants) {
      if (!isSelectField(variants)) return defaultValue;
      return defaultValue ?? true;
    },
    $borderType(defaultValue, variants) {
      if (!isSelectField(variants)) return defaultValue;
      if (!variants.$border) return defaultValue;
      // Keep field geometry consistent across light and dark surfaces.
      if (defaultValue != null && defaultValue !== "auto") return defaultValue;
      return "border";
    },
    $edgeWeight(defaultValue, variants) {
      if (!isSelectField(variants)) return defaultValue;
      if (!variants.$border) return defaultValue;
      if (defaultValue != null) return defaultValue;
      // Disabled fields keep a faint edge.
      if (variants.$disabled) return 10;
      return defaultValue;
    },
    $edgeContrast(defaultValue, variants) {
      if (!isSelectField(variants)) return defaultValue;
      if (!variants.$border) return defaultValue;
      // Match the input's 3:1 boundary contrast.
      return defaultValue ?? true;
    },
    $edgeRaw(defaultValue, variants) {
      if (!isSelectField(variants)) return defaultValue;
      return getInputEdgeRaw(defaultValue, variants);
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
    addClass(inputInvalidEdge);
    if (variants.$borderType !== "border") return;
    // Preserve the field boundary when button disabled styles clear its border.
    addClass("[--disabled-border:var(--ak-edge)]");
  },
});

/** A select arrow aligned at the end of the control. */
export const comboboxSelectArrow = cv({
  extend: [buttonSlot],
  class: "ms-auto",
});

/** Select label text with optional truncation. */
export const comboboxSelectLabel = controlFieldLabel;

/** Placeholder-colored text for an empty select trigger. */
export const comboboxSelectPlaceholder = inputPlaceholder;

/** A selection mark that keeps its space when empty. */
export const comboboxItemCheck = cv({
  extend: [optionSlot],
  class: "pointer-events-none [&:empty]:invisible",
});
