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
  controlLabelRow,
  controlSlot,
  fadesDisabledSurface,
} from "./control.ts";
import { focusHighlight, focusWithin } from "./focus.ts";
import { hover } from "./hover.ts";
import { hasLayerBackground } from "./layer.ts";

// The box radius wins over the radius that a slot computes for floating and
// avatar slots. The switch mark can't set it in the same object, so it replaces
// this value in its computed default.
const choiceBase = cv({
  extend: [controlSlot, hover],
  defaultVariants: {
    $rounded: "sm",
  },
});

/**
 * A checkbox, radio, or switch mark with the geometry of a control slot. State
 * comes from the input or a surrounding choice host; a child replaces the drawn
 * mark.
 */
export const choice = cv({
  extend: [choiceBase],
  class: [
    "appearance-none",
    // Restore text-line alignment for bare inputs; flex and grid parents still
    // control placement.
    "inline-flex align-middle",
    // Keep forced colors from replacing the mark background with the system
    // canvas.
    "after:forced-color-adjust-none",
    // The mark then inherits the box's text color from before forced colors,
    // which can match the canvas. Set the system text color for it to inherit.
    "forced-colors:text-[CanvasText]",
    // A custom child replaces the drawn mark and uses the same size and state.
    "[--slot-icon-size:calc(var(--size)*0.7)] [&>svg]:stroke-[2.5]",
    "has-[>*]:after:hidden not-ui-choice-on:*:hidden!",
    // Separate the selected fill from brand surfaces. The plugin's zero-lighten
    // utility cancels the default lightening stored in the style attribute.
    "not-ui-choice-disabled:ui-choice-on:ak-layer-brand",
    "not-ui-choice-disabled:ui-choice-on:ak-layer-contrast",
    "ui-choice-on:ak-layer-lighten-0 ui-choice-on:ak-edge-raw",
    // The selected fill keeps its color; the chroma cap is for the raised box.
    "ui-choice-on:ak-layer-max-c-[initial]",
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
     * check mark and, in the mixed state, a dash. `dot` draws an outlined dot:
     * a rim and a center dot in the checked fill with the surface between them.
     * `switch` draws a pill track with a thumb that moves to the end side while
     * the choice is on and stops at the center in the mixed state.
     * @default "check"
     */
    $mark: {
      check: [
        // Use the layer's readable text color for the mark in checked and
        // disabled states.
        "after:bg-current",
        "after:size-(--slot-icon-size) after:mask-(--choice-mark-check)",
        "after:mask-contain after:mask-center after:mask-no-repeat",
        "ui-choice-mixed:after:mask-(--choice-mark-dash)",
        // Both marks only move rightward at a constant speed: the check's two
        // strokes are at 45 degrees and the dash is level. A left-to-right wipe
        // therefore follows the line as if it were being written.
        "after:[clip-path:inset(0_100%_0_0)] ui-choice-on:after:[clip-path:inset(0)]",
        // Only the on state sets these, so unchecking is immediate.
        "motion-safe:ui-choice-on:after:transition-[clip-path]",
        "motion-safe:ui-choice-on:after:duration-150",
        "motion-safe:ui-choice-on:after:ease-linear",
      ],
      dot: [
        "after:scale-0 ui-choice-on:after:scale-100",
        "after:transition-transform after:duration-100 after:ease-out",
        "motion-reduce:after:transition-none",
        // The center dot and the rim, which includes the border, take the
        // box's fill, so both keep its contrast against the surface ring
        // between them. The ring is 14% of the box's inner width.
        "[--choice-mark-gap:calc((var(--size)-2*var(--border-width))*0.14)]",
        "after:size-[calc(100%-2*(var(--choice-mark-rim)-var(--border-width)+var(--choice-mark-gap)))]",
        "after:rounded-full after:bg-(--ak-layer)",
        "after:ring-(length:--choice-mark-gap) after:ring-(--ak-layer-parent)",
        // Forced colors replace the fill with the system canvas, so the border
        // is the rim. Draw the dot in the text color without the ring.
        "forced-colors:after:bg-current forced-colors:after:ring-0",
      ],
      switch: [
        "w-[calc(var(--size)*1.75)]",
        // The thumb moves from the center to the center of each round end, so
        // it stays concentric with the track at any thumb size.
        "[--choice-switch-dir:1] rtl:[--choice-switch-dir:-1]",
        "[--choice-switch-travel:calc(var(--size)*0.375*var(--choice-switch-dir))]",
        "after:-translate-x-(--choice-switch-travel)",
        "ui-choice-on:after:translate-x-(--choice-switch-travel)",
        "ui-choice-mixed:after:translate-x-0",
        // The thumb takes the track's readable text color, because the edge
        // color can fall below 3:1 against the track. It grows on the fill.
        "after:size-(--slot-icon-size) after:rounded-full after:bg-current",
        "after:scale-75 ui-choice-on:after:scale-100",
        // Unlike the check, the switch animates both ways, because its thumb
        // travels between two resting positions.
        "motion-safe:transition-[background-color,border-color,color]",
        "motion-safe:duration-150 motion-safe:ease-out",
        "motion-safe:after:transition-[translate,scale]",
        "motion-safe:after:duration-150 motion-safe:after:ease-out",
      ],
    },
    /**
     * Sets the rim width of the `dot` mark, including the box border. Numbers
     * are pixels; other values are CSS lengths. A thinner rim leaves more room
     * for the center dot. Defaults to 2px for the `dot` mark.
     */
    $markRim(value?: number | (string & {})) {
      if (value == null) return;
      const width = typeof value === "number" ? `${value}px` : value;
      return { style: { "--choice-mark-rim": width } };
    },
  },
  defaultVariants: {
    $mark: "check",
    $markRim(defaultValue, variants) {
      if (variants.$mark !== "dot") return defaultValue;
      return defaultValue ?? 2;
    },
    // A switch needs more room than a box to show its thumb's two positions.
    $size(defaultValue, variants) {
      // Preserve any size supplied by an extender.
      if (defaultValue !== "md") return defaultValue;
      if (variants.$mark === "switch") return "lg";
      return defaultValue;
    },
    $square(defaultValue, variants) {
      if (variants.$mark === "switch") return false;
      return defaultValue;
    },
    $rounded(defaultValue, variants) {
      // Radios and card checks set their own radius.
      if (defaultValue !== "sm") return defaultValue;
      if (variants.$mark === "switch") return "full";
      return defaultValue;
    },
    // Preserve the box shape independently of the surrounding card or row.
    $forceRounded: true,
    // The slot fixes the outer size. Match the input's raised surface and 3:1
    // boundary contrast.
    $border: true,
    $borderType: "border",
    $edgeContrast: true,
    $lighten: true,
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
    // A click can't change a checked radio, so hover doesn't light it.
    "ui-settled:ui-hover:ak-state-0",
    "ui-settled:group-hover/choice-field:ak-state-0",
  ],
  defaultVariants: {
    $focus: true,
    $hoverOffset: 3,
  },
  refine({ variants, addClass }) {
    // A system checkbox can't show a switch, so the switch keeps its own marks.
    if (variants.$mark === "switch") return;
    addClass("forced-colors:appearance-auto forced-colors:after:hidden");
  },
});

/**
 * A label row for a native choice input and its description. The input supplies
 * the surface and focus ring. Without a background or a border, the row has no
 * padding unless `$p` is set. The input then starts at the edge, like a list
 * bullet, so it lines up with a group label, hints, and a field error. A border
 * gives the row a transparent layer, so, like a card, it sets its own text and
 * edge colors.
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
    // A border derives its edge color from a layer on the same element, so a
    // bordered row gets one that paints no background.
    $layer(_defaultValue, variants) {
      if (variants.$border) return "transparent";
      return false;
    },
    // Without a background or border, the row box is invisible. Padding would
    // only move the input away from the field edge. Only control's default of 2
    // is replaced, so an extender's static $p of another value still applies.
    $p(defaultValue, variants) {
      if (defaultValue !== 2) return defaultValue;
      if (hasLayerBackground(variants)) return defaultValue;
      if (variants.$border) return defaultValue;
      return "none";
    },
  },
  refine({ variants, addClass }) {
    // Fade the row while its input is disabled, as control does for $disabled.
    if (!fadesDisabledSurface(variants)) return;
    addClass("ui-disabled-within:ak-layer-fade-80");
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
    // Without a mark, an inset ring adds a second edge pixel to the selected
    // card, so its state doesn't rest on color alone. The ring takes no space.
    "inset-ring-(--ak-edge)",
    "not-has-[.choice-card-check]:ui-checked-within:inset-ring",
    "not-has-[.choice-card-check]:ui-mixed-within:inset-ring",
    // Forced colors remove shadows. Use a real border one pixel wider instead.
    "not-has-[.choice-card-check]:ui-checked-within:forced-colors:ak-frame-border-[length:calc(var(--border-width,1px)+1px)]",
    "not-has-[.choice-card-check]:ui-mixed-within:forced-colors:ak-frame-border-[length:calc(var(--border-width,1px)+1px)]",
    // A click can't change a checked radio card, so hover doesn't light it.
    "ui-settled:ui-hover:ak-state-0",
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
    "ui-disabled-within:ak-edge-5 ui-disabled-within:ak-layer-fade-80",
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
        "*:[--control-inline:0]!",
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
    $disabled: ["[--disabled-border:var(--ak-edge)]", "ak-edge-5"],
  },
  defaultVariants: {
    $rounded: "xl",
    $p: 3,
    $gapY: "card",
    $border: true,
    $darkEdgeWeight(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$edgeRaw) return defaultValue;
      // A caller's edge weight or color applies on every surface.
      if (variants.$edgeWeight != null && variants.$edgeWeight !== "unset") {
        return defaultValue;
      }
      if (variants.$edge != null && variants.$edge !== "unset") {
        return defaultValue;
      }
      return "light";
    },
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
  refine({ variants, setVariants }) {
    // Fade every disabled card, including the neutral cards that button keeps
    // as the boundary.
    if (!variants.$disabled) return;
    setVariants({ $fade: 80 });
  },
});

/**
 * A card check indicator whose state follows the nested input. A child replaces
 * the drawn mark.
 */
export const choiceCardCheck = cv({
  extend: [choice],
  // Cards without this mark draw a second edge pixel when selected.
  class: "choice-card-check",
  variants: {
    /**
     * Places the check in the card's top-end corner and hides it when
     * unchecked.
     */
    $floating: [
      "not-ui-choice-on:scale-0",
      // The check paints outside the card, so it takes its colors from the
      // surface around the card.
      "ak-outset",
      // The whole check grows from its center. The scale property is separate
      // from translate, so the check stays on the corner.
      "motion-safe:ui-choice-on:transition-[scale]",
      "motion-safe:ui-choice-on:duration-(--duration-overshoot)",
      "motion-safe:ui-choice-on:ease-overshoot",
      // The state changes the colors at once. Hold them until the check has
      // shrunk.
      "motion-safe:not-ui-choice-on:transition-[scale,background-color,color]",
      "motion-safe:not-ui-choice-on:duration-150",
      "motion-safe:not-ui-choice-on:ease-[var(--ease-in-out),step-end,step-end]",
    ],
  },
  defaultVariants: {
    $size: "lg",
    // The card already supplies hover feedback.
    $hoverOffset: false,
    $rounded: "full",
  },
  refine({ variants, addClass }) {
    if (!variants.$floating) return;
    if (variants.$mark !== "check") return;
    addClass([
      // The mark starts once the check has mostly grown.
      "motion-safe:ui-choice-on:after:delay-100",
      // The check shrinks as a whole, so the mark stays until it's gone instead
      // of hiding when the state changes. The mask keeps a mixed check's dash
      // from turning into a check on the way out.
      "motion-safe:not-ui-choice-on:after:transition-[clip-path,mask-image]",
      "motion-safe:not-ui-choice-on:after:transition-discrete",
      "motion-safe:not-ui-choice-on:after:duration-0",
      "motion-safe:not-ui-choice-on:after:delay-150",
    ]);
  },
});

/** A text-aligned slot for choice card icons and other content. */
export const choiceCardSlot = buttonSlot;

/** A flexible wrapper for a choice card's label and description. */
export const choiceCardContent = buttonContent;

/**
 * A row in a choice card's content for the label and the slots that go with it,
 * such as a badge. The description takes the full width below the row.
 */
export const choiceCardLabelRow = controlLabelRow;

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
