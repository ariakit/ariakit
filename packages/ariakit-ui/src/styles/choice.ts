import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import {
  button,
  buttonContent,
  buttonDescription,
  buttonLabel,
  buttonSlot,
} from "./button.ts";
import {
  control,
  controlContent,
  controlDescription,
  controlLabel,
  controlSlot,
} from "./control.ts";
import { focusHighlight, focusWithin } from "./focus.ts";
import { hover } from "./hover.ts";

/**
 * A checkbox or radio mark with control-slot geometry. State comes from the
 * input or a surrounding choice host; a child replaces the drawn mark.
 */
export const choice = cv({
  extend: [controlSlot, hover],
  class: [
    "appearance-none",
    // Restore text-line alignment for bare inputs; flex and grid parents still
    // control placement.
    "inline-flex align-middle",
    // Use the layer's readable text color for the mark in checked and disabled
    // states.
    "after:bg-current after:scale-0 ui-choice-on:after:scale-100",
    "after:transition-transform after:duration-100 after:ease-out",
    "motion-reduce:after:transition-none",
    // Keep forced colors from replacing the mark background with the system
    // canvas.
    "after:forced-color-adjust-none",
    // A custom child replaces the drawn mark and uses the same size and state.
    "[--slot-icon-size:calc(var(--size)*0.7)] [&>svg]:stroke-[2.5]",
    "has-[>*]:after:hidden not-ui-choice-on:*:hidden!",
    // Separate the selected fill from brand surfaces. The plugin's zero-offset
    // utility cancels the default offset stored in the style attribute.
    "not-ui-choice-disabled:ui-choice-on:ak-layer-brand",
    "not-ui-choice-disabled:ui-choice-on:ak-layer-contrast",
    "ui-choice-on:ak-layer-offset-0 ui-choice-on:ak-edge-raw",
    // Keep disabled marks and empty boxes distinct on light surfaces.
    "ui-choice-disabled:ui-choice-on:ak-layer-15",
    "ui-choice-disabled:ak-ink-0 ui-choice-disabled:ak-edge-20",
    // Forced colors replace the ink and edge with the normal text color. Use
    // the system disabled color for the mark and the box. A native input needs
    // the edge rule in Chromium; other hosts follow the text color.
    "ui-choice-disabled:forced-colors:text-[GrayText]",
    "ui-choice-disabled:forced-colors:border-[GrayText]",
    "ui-choice-disabled:cursor-not-allowed",
  ],
  variants: {
    /**
     * The mark drawn inside the box while the choice is on. `check` draws a
     * check mark and, in the mixed state, a dash. `dot` draws a filled disc.
     * @default "check"
     */
    $mark: {
      check: [
        "after:size-(--slot-icon-size) after:mask-(--choice-mark-check)",
        "after:mask-contain after:mask-center after:mask-no-repeat",
        "ui-choice-mixed:after:mask-(--choice-mark-dash)",
      ],
      dot: "after:size-1/2 after:rounded-full",
    },
  },
  defaultVariants: {
    $mark: "check",
    $rounded: "sm",
    // Preserve the box shape independently of the surrounding card or row.
    $forceRounded: true,
    // The slot fixes the outer size. Match the input's 3:1 boundary contrast.
    $border: true,
    $borderType: "border",
    $edgeWeight: 45,
    $lightnessOffset: -1,
    $hoverOffset: true,
    $layer(defaultValue) {
      // Replace only the slot's transparent default; explicit colors still
      // apply.
      if (defaultValue === "transparent") return true;
      return defaultValue;
    },
  },
});

/**
 * A native choice input with field-row hover, keyboard focus, and system
 * rendering in forced-colors mode.
 */
export const choiceInput = cv({
  extend: [choice, focusHighlight],
  class: [
    "not-ui-choice-disabled:group-hover/choice-field:ak-state-(--hover-offset,0)",
    "forced-colors:appearance-auto forced-colors:after:hidden",
  ],
  defaultVariants: {
    $focus: true,
    $hoverOffset: 3,
  },
});

/**
 * A label row for a native choice input and its description. The input supplies
 * the surface and focus ring.
 */
export const choiceField = cv({
  extend: [control],
  class: [
    "group/choice-field",
    "justify-start select-none",
    // Group-disabled inputs may not pass $disabled to the row. Read their DOM
    // state and dim descendants, including independently colored descriptions.
    "ui-disabled-within:ak-disabled",
    "ui-disabled-within:cursor-not-allowed",
    "ui-disabled-within:ak-ink-0 ui-disabled-within:**:ak-ink-0",
    // An adaptive text color on the row or an ancestor targets nested text
    // with higher specificity. The ui-text rules here and in forced colors set
    // the disabled color on the same targets.
    // https://github.com/ariakit/ariakit/issues/7869
    "ui-disabled-within:not-forced-colors:ui-text:ak-ink-0",
    // Forced colors replace the ink with the normal text color. Use the system
    // disabled color instead.
    "ui-disabled-within:forced-colors:text-[GrayText]",
    "ui-disabled-within:forced-colors:**:text-[GrayText]",
    "ui-disabled-within:forced-colors:ui-text:text-[GrayText]",
  ],
  defaultVariants: {
    // Resolve the input against the surrounding surface without an extra layer.
    $layer: false,
  },
});

/** A flexible wrapper for a choice field's label and description. */
export const choiceFieldContent = controlContent;

/** Choice field label text with optional truncation. */
export const choiceFieldLabel = controlLabel;

/** Secondary choice field text with optional line limits. */
export const choiceFieldDescription = controlDescription;

/** A card label whose tint follows a nested input's checked or mixed state. */
export const choiceCard = cv({
  extend: [button, focusWithin],
  class: [
    // Let slots read the nested input's disabled state.
    "group/choice",
    // Allow a direct description to occupy its own row.
    "flex-wrap justify-start content-start",
    "[&_input]:sr-only",
    // The label reads checked, mixed, and disabled states from its input.
    "not-ui-disabled-within:ui-checked-within:ak-edge-brand",
    "not-ui-disabled-within:ui-checked-within:ak-edge-raw",
    "not-ui-disabled-within:ui-checked-within:ak-layer-brand",
    "not-ui-disabled-within:ui-checked-within:ak-layer-mix-20",
    "not-ui-disabled-within:ui-mixed-within:ak-edge-brand",
    "not-ui-disabled-within:ui-mixed-within:ak-edge-raw",
    "not-ui-disabled-within:ui-mixed-within:ak-layer-brand",
    "not-ui-disabled-within:ui-mixed-within:ak-layer-mix-20",
    // Use the plugin's zero-lighten utility to cancel the default inline
    // channel.
    "not-ui-disabled-within:ui-checked-within:ak-layer-lighten-0",
    "not-ui-disabled-within:ui-mixed-within:ak-layer-lighten-0",
    // Keep selected cards distinct on brand surfaces, including colors in the
    // contrast pipeline's ambiguous range.
    "not-ui-disabled-within:ui-checked-within:ak-layer-push-1",
    "not-ui-disabled-within:ui-mixed-within:ak-layer-push-1",
    // Group-disabled cards may not receive $disabled. Read the input state and
    // suppress hover and press on the label too.
    "ui-disabled-within:ak-disabled",
    "ui-disabled-within:cursor-not-allowed",
    "ui-disabled-within:ak-ink-0 ui-disabled-within:**:ak-ink-0",
    // An adaptive text color on the card or an ancestor targets nested text
    // with higher specificity. The ui-text rules here and in forced colors set
    // the disabled color on the same targets.
    // https://github.com/ariakit/ariakit/issues/7869
    "ui-disabled-within:not-forced-colors:ui-text:ak-ink-0",
    "ui-disabled-within:ak-edge-5 ui-disabled-within:ak-layer-mix-20",
    // Forced colors replace the ink with the normal text color. Use the system
    // disabled color instead; the label's edge follows the text color.
    "ui-disabled-within:forced-colors:text-[GrayText]",
    "ui-disabled-within:forced-colors:**:text-[GrayText]",
    "ui-disabled-within:forced-colors:ui-text:text-[GrayText]",
    "ui-disabled-within:ui-hover:ak-state-0",
    "ui-disabled-within:ui-active:scale-x-100",
    "ui-disabled-within:ui-active:scale-y-100",
  ],
  variants: {
    /**
     * Sets the card flow. `vertical` puts the slot and check above full-width
     * content and removes their inline margins. It also rounds nested `$cover`
     * frames for a column.
     */
    $orientation: {
      vertical: [
        // Override the control's reset of this flag on direct children.
        "[&>*]:[--control-inline:0]!",
        // Override the later-sorted justify-start and justify-center utilities.
        "justify-between!",
        // Keep shorter badges from stretching to the tallest slot. Zero
        // specificity lets caller alignment classes override this.
        // https://github.com/ariakit/ariakit/issues/7599
        "[:where(&)]:items-start",
        "[&>.control-content]:basis-full [&>.control-content]:order-1",
      ],
    },
    /**
     * Sets the vertical gap between the element's label and description.
     * @default "card"
     */
    $gapY: {
      // Share the smaller wrapped-row gap with the content wrapper.
      card: "[--gap-y:calc(var(--py)/2)] gap-y-(--gap-y)",
    },
    /** Applies disabled styles while keeping a faint card boundary. */
    $disabled: [
      "[--disabled-border:var(--ak-edge)]",
      "ak-edge-5 ak-layer-mix-20",
    ],
  },
  defaultVariants: {
    $rounded: "xl",
    $p: 3,
    $gapY: "card",
    $border: true,
    $focusOffset: 2,
    // Lighten cards unconditionally instead of darkening them on light
    // surfaces.
    $lightnessOffset: false,
    $lighten: true,
    // Vertical cards align slots to the frame padding without extra text
    // insets.
    $px(defaultValue, variants) {
      if (defaultValue == null) return;
      if (variants.$orientation === "vertical") return "sm";
      return defaultValue;
    },
  },
});

/**
 * A card check indicator whose state follows the nested input. A child replaces
 * the drawn mark.
 */
export const choiceCardCheck = cv({
  extend: [choice],
  variants: {
    /**
     * Places the check in the card's top-end corner and hides it when
     * unchecked.
     */
    $floating: "not-ui-choice-on:invisible",
  },
  defaultVariants: {
    $size: "lg",
    // The card already supplies hover feedback.
    $hoverOffset: false,
    $rounded(defaultValue, variants) {
      if (variants.$floating) return "full";
      return defaultValue;
    },
  },
});

/** A text-aligned slot for choice card icons and other content. */
export const choiceCardSlot = buttonSlot;

/** A flexible wrapper for a choice card's label and description. */
export const choiceCardContent = buttonContent;

/** A card label that fills the space between its slots. */
export const choiceCardLabel = cv({
  extend: [buttonLabel],
  defaultVariants: {
    $grow: true,
  },
});

/** Secondary choice card text that truncates by default. */
export const choiceCardDescription = buttonDescription;

/** A responsive grid of choice cards with equal row heights. */
export const choiceCardGrid = cv({
  class: [
    "grid auto-rows-fr gap-3",
    // Let the grid shrink below its cards' text width.
    "min-w-0",
    // Keep the minimum column width within the available space.
    "grid-cols-[repeat(auto-fill,minmax(min(100%,var(--choice-card-min-w)),1fr))]",
  ],
  variants: {
    /**
     * Sets the narrowest a card may get before the grid drops a column. Numbers
     * scale the spacing token.
     * @default "10rem"
     */
    $minItemSize(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--choice-card-min-w": getSpacingValue(value) },
      };
    },
  },
  defaultVariants: {
    $minItemSize: "10rem",
  },
});
