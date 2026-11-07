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
  class: [
    // A row that can't shrink below its content never scrolls.
    "breadcrumb min-w-0",
    // Zero specificity lets caller text-* classes win.
    "ui-base:text-sm",
    "[--breadcrumb-gap:--spacing(1)]",
  ],
  variants: {
    /**
     * Keeps the steps on one row that scrolls sideways. The row starts at the
     * end of the trail, so the current step shows without script. Labels with
     * `$truncate` stay whole, because the row has all the room it needs.
     */
    $scroll: [
      "flex flex-row-reverse overflow-x-auto overflow-y-hidden overscroll-x-none",
      // The list is the only flex child, so the steps keep their order, and a
      // short trail stays at the start through the auto margin.
      "[&>.breadcrumb-list]:flex-none [&>.breadcrumb-list]:w-max",
      "[&>.breadcrumb-list]:flex-nowrap [&>.breadcrumb-list]:me-auto",
      // The scroll container clips, so the padding keeps room for focus rings,
      // and the first step and the list stay inside it.
      "[&>.breadcrumb-list]:p-1 [&>.breadcrumb-list]:ms-0 [--breadcrumb-pull:0]",
    ],
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
  class: [
    "breadcrumb-list flex flex-wrap items-center min-w-0 list-none",
    "gap-x-(--breadcrumb-gap) gap-y-0",
    // Auto tracks start at the minimum width of each step and share the free
    // space equally up to the full width of each step. So short labels get all
    // of their text first, and the longest ones clip first. Flex items would
    // all shrink together.
    "has-[.breadcrumb-truncate]:grid has-[.breadcrumb-truncate]:grid-flow-col",
    "has-[.breadcrumb-truncate]:auto-cols-auto has-[.breadcrumb-truncate]:justify-start",
    // Steps that don't clip stay whole.
    "has-[.breadcrumb-truncate]:[&>li:not(:has(.breadcrumb-truncate))]:min-w-max",
    // A row that no longer fits must not widen the page. The end padding keeps
    // room for a focus ring.
    "has-[.breadcrumb-truncate]:overflow-x-clip has-[.breadcrumb-truncate]:pe-1",
    // The first step hangs past the start of the row, so the clip starts
    // further out. The padding and the margin cancel each other in the layout,
    // and the padding must not take pointer events from what comes before.
    "has-[.breadcrumb-truncate]:ps-4 has-[.breadcrumb-truncate]:-ms-4",
    "has-[.breadcrumb-truncate]:pointer-events-none has-[.breadcrumb-truncate]:*:pointer-events-auto",
  ],
});

/**
 * A list item that holds one step. A step that truncates takes its minimum
 * width from its content.
 */
export const breadcrumbItem = cv({
  class: [
    "breadcrumb-item flex items-center min-w-0 max-w-full shrink-0",
    "has-[.breadcrumb-truncate]:min-w-auto",
  ],
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
    // The step is a flex item of its list item, and a clipped label needs it to
    // shrink.
    "justify-start text-wrap min-w-0",
    // The first step hangs by its own side padding, so its content lines up with
    // the text around the trail at any $px. Slots usually move into that
    // padding. Here a slot stays at the padding edge, which holds at any slot
    // size, and a slot alone stays centered.
    "[.breadcrumb-item:first-child>&:first-child]:ms-[calc(var(--px)*var(--breadcrumb-pull,1)*-1)]",
    "[.breadcrumb-item:first-child>&:first-child>.slot-frame-slot:first-child]:ms-0",
    "[.breadcrumb-item:first-child>&:first-child>.slot-frame-slot:only-child]:me-0",
    // Buttons can't be selected, but a trail can be copied. Only a rule with the
    // same condition can undo the one in the button.
    "not-[button]:select-text",
    "not-ui-selected:font-normal",
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
    addClass("breadcrumb-step-quiet");
  },
});

/**
 * A step that links to a level above the current one. It shows no surface at
 * rest or on hover, so it underlines its text on hover. Set `$hoverOffset` or
 * another layer hover variant to show a hover surface instead.
 */
export const breadcrumbLink = cv({
  extend: [breadcrumbStep],
  class:
    "[&.breadcrumb-step-quiet]:ui-hover:underline decoration-1 underline-offset-[0.25em]",
  defaultVariants: {
    $ink: 70,
    $selectedInk: 100,
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
    // The text can break anywhere and shows one line, which looks like nowrap,
    // but it gives the label a small minimum width and keeps its full width.
    // The step and the list item then find their minimum from the label, the
    // padding, and the slots. The minimum leaves room for a letter and the
    // ellipsis. Where calc-size() works, it adds no space beside narrower text.
    // WebKit keeps the plain minimum, because it gives a flex item with this
    // minimum its full max-content width, and the labels overlap.
    $truncate: [
      "breadcrumb-truncate min-w-[3ch]",
      "supports-[width:calc-size(auto,size)]:not-supports-[font:-apple-system-body]:min-w-[calc-size(max-content,min(size,3ch))]",
      "whitespace-normal! break-all line-clamp-1",
    ],
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
  class: [
    "shrink-0",
    // Stands in for the gap of a control group, so the mark needs more strength
    // beside muted text than it has beside a control surface.
    "not-[.chevron]:ak-edge-alpha-[0.36]",
    // The margin of a control separator closes the padding of a control group.
    // A padded parent must not pull the mark over the steps around it.
    "[--ak-frame-padding:0px] [--group-gap:var(--breadcrumb-gap)]",
    // Steps sit in list items, where the sibling rules of a group can't see
    // them, and an item can hold more than one control. Only the control that
    // faces the mark counts, and only if it paints a surface: a quiet step
    // paints nothing on hover, and an expanded control needs a selected surface.
    "[li:has(>:nth-last-child(1_of_.control):hover:not(.breadcrumb-step-quiet,:disabled,[aria-disabled='true']))+&]:opacity-(--separator-shy-opacity)",
    "has-[+li>:nth-child(1_of_.control):hover:not(.breadcrumb-step-quiet,:disabled,[aria-disabled='true'])]:opacity-(--separator-shy-opacity)",
    "[li:has(>:nth-last-child(1_of_.control):focus-visible)+&]:opacity-(--separator-shy-opacity)",
    "has-[+li>:nth-child(1_of_.control):focus-visible]:opacity-(--separator-shy-opacity)",
    "[li:has(>:nth-last-child(1_of_.control).popover-disclosure-surface[aria-expanded='true'])+&]:opacity-(--separator-shy-opacity)",
    "has-[+li>:nth-child(1_of_.control).popover-disclosure-surface[aria-expanded='true']]:opacity-(--separator-shy-opacity)",
  ],
  variants: {
    /** Sets the mark. `none` paints nothing, for custom content in children. */
    $kind: {
      none: "h-auto! border-e-0! [&>svg]:size-4",
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
