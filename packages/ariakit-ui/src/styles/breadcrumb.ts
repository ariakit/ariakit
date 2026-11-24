import type { VariantProps } from "clava";
import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { button, buttonLabel, buttonSlot } from "./button.ts";
import { controlSeparator } from "./control.ts";
import type { hover } from "./hover.ts";

/**
 * A navigation region for a trail of steps. Long trails wrap. With `$scroll`,
 * they keep one row that scrolls sideways and starts at the end of the trail.
 */
export const breadcrumb = cv({
  class: "ui-breadcrumb",
  variants: {
    /**
     * Keeps the steps on one row that scrolls sideways. The row starts at the
     * end of the trail, so the current step shows without script. Labels with
     * `$truncate` stay whole, because the row has all the room it needs.
     */
    $scroll: "ui-breadcrumb--scroll",
    /** Sets the space between steps. Numbers scale the spacing token. */
    $gap(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--breadcrumb-gap": getSpacingValue(value) },
      };
    },
  },
});

/**
 * An ordered list of steps. A step that truncates stops the row from wrapping,
 * because a row that can wrap moves the step to the next line instead of
 * clipping it.
 */
export const breadcrumbList = cv({
  class: "ui-breadcrumb-list flex-wrap",
});

/**
 * A list item that holds one step. A step that truncates takes its minimum
 * width from its content.
 */
export const breadcrumbItem = cv({
  class: "ui-breadcrumb-item",
});

/** Whether a hover variant paints a surface on the step. */
function hasLayerHover(variants: VariantProps<typeof hover>) {
  if (variants.$hoverOffset) return true;
  if (variants.$hoverPush) return true;
  if (variants.$hoverLighten) return true;
  if (variants.$hoverDarken) return true;
  if (variants.$hoverSaturate) return true;
  return Boolean(variants.$hoverDesaturate);
}

// A button with quieter defaults, so a step reads as text above a page title.
const breadcrumbStep = cv({
  extend: [button],
  class: [
    "ui-breadcrumb-step",
    // Buttons can't be selected, but a trail can be copied. Only a rule with
    // the same condition can undo the one in the button.
    // Stays a class to come after the user-select of `ui-button`, which it
    // replaces.
    "not-[button]:select-text",
  ],
  defaultVariants: {
    $p: 1,
    $hoverOffset: false,
    // The default gap follows the small padding, and leaves a slot too close to
    // its label.
    $gap: "lg",
  },
  refine({ variants, addClass }) {
    // A quiet step paints nothing on hover, so the separators stay beside it.
    if (hasLayerHover(variants)) return;
    addClass("ui-breadcrumb-step--quiet");
  },
});

/**
 * A step that links to a level above the current one. It shows no surface at
 * rest or on hover, so it underlines its text on hover. Set `$hoverOffset` or
 * another layer hover variant to show a hover surface instead.
 */
export const breadcrumbLink = cv({
  extend: [breadcrumbStep],
  class: "ui-breadcrumb-link",
  defaultVariants: {
    $ink: 70,
    $selectedInk: 100,
  },
});

/**
 * A step for a level without a page of its own, such as a category, as text
 * with no interactive state. It has the ink of the links, so it reads as a
 * level above the current page.
 */
export const breadcrumbText = cv({
  extend: [breadcrumbStep],
  class: "cursor-default",
  defaultVariants: {
    $ink: 70,
    $hoverInk: false,
    $active: false,
    $focus: false,
  },
});

/** The step of the current page, as text with no interactive state. */
export const breadcrumbCurrent = cv({
  extend: [breadcrumbStep],
  class: "cursor-default",
  defaultVariants: {
    $hoverInk: false,
    $active: false,
    $focus: false,
  },
});

/**
 * The text of a step. Use it beside a slot, because the gaps and the slot
 * margins need an element on each side. A step is a flex box, where text clips
 * only inside its own element, so set `$truncate` here to clip a label.
 */
export const breadcrumbLabel = cv({
  extend: [buttonLabel],
  variants: {
    $truncate: "ui-breadcrumb-label--truncate",
  },
  defaultVariants: {
    $truncate: false,
  },
});

/** An icon, avatar, or thumbnail beside the text of a step. */
export const breadcrumbSlot = buttonSlot;

/** A hidden mark between steps: a slash, chevron, pipe, or custom content. */
export const breadcrumbSeparator = cv({
  extend: [controlSeparator],
  class: "ui-breadcrumb-separator",
  variants: {
    /** Sets the mark. `none` paints nothing, for custom content in children. */
    $kind: {
      none: "ui-breadcrumb-separator--kind-none",
    },
  },
  defaultVariants: {
    $kind: "slash",
    $size: "sm",
    $ink(defaultValue, variants) {
      if (variants.$kind !== "none") return defaultValue;
      return defaultValue ?? 40;
    },
  },
});
