import { cv, cx } from "clava";
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
  controlFieldDescription,
  controlFieldLabel,
  controlLabel,
  controlLabelRow,
  controlSlot,
  fadesDisabledSurface,
} from "./control.ts";
import { focusHighlight, focusWithin } from "./focus.ts";
import { hover } from "./hover.ts";
import { hasLayerBackground } from "./layer.ts";
import { isSegmentedKind } from "./segment.ts";

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
     * check mark and, in the mixed state, a dash. `dot` draws a round bullet in
     * the center of the checked fill. `switch` draws a pill track with a thumb
     * that moves to the end side while the choice is on and stops at the center
     * in the mixed state.
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
        // Like the check, the bullet takes the fill's readable text color, so
        // it keeps its contrast against the box in checked and disabled states.
        "after:size-[calc((var(--size)-2*var(--border-width))*0.5)]",
        "after:rounded-full after:bg-current",
        // The fill changes at once, and the bullet grows from the center.
        "after:scale-0 ui-choice-on:after:scale-100",
        // Only the on state sets these, so unchecking is immediate.
        "motion-safe:ui-choice-on:after:transition-[scale]",
        "motion-safe:ui-choice-on:after:duration-150",
        "motion-safe:ui-choice-on:after:ease-in-out",
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
  },
  defaultVariants: {
    $mark: "check",
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
    // Zero specificity lets a plain cursor utility replace the pointer.
    "[:where(&)]:cursor-pointer",
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
    if (variants.$hoverOffset) {
      addClass([
        // The offset can darken the selected fill, which takes it toward a dark
        // surface. Keep the fill there, and show hover with a lighter border.
        // High contrast already makes the border white and the fill stays far
        // from the surface, so it keeps the offset.
        "ak-dark:not-contrast-more:ui-choice-on:ui-hover:ak-state-0",
        "ak-dark:not-contrast-more:ui-choice-on:not-ui-settled:ui-hover:ak-edge-lighten-25",
        "ak-dark:not-contrast-more:ui-choice-on:not-ui-choice-disabled:group-hover/choice-field:ak-state-0",
        "ak-dark:not-contrast-more:ui-choice-on:not-ui-settled:not-ui-choice-disabled:group-hover/choice-field:ak-edge-lighten-25",
      ]);
    }
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
    // Zero specificity lets a plain cursor utility replace the pointer.
    "[:where(&)]:cursor-pointer justify-start select-none",
    // The box follows a cursor set on the row. This outranks the pointer on the
    // input, but not a plain cursor utility on it.
    "[:where(&)_input:where([type=checkbox],[type=radio])]:cursor-[inherit]",
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

// The surface of a card. A segmented kind paints the thumb of its group
// instead.
const choiceCardSurface = cx(
  // Choice groups give cards more room than simple fields.
  "choice-card",
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
);

// The input covers a segment, so it takes the hover and the focus of a tooltip
// anchored to it. Labels center in the segment instead of filling a card row.
const choiceCardSegment = cx(
  // WebKit doesn't stretch an input with inset alone.
  "[&_input]:absolute [&_input]:inset-0 [&_input]:size-full [&_input]:m-0 [&_input]:opacity-0",
  "[&_input]:cursor-[inherit]",
  "*:grow-0 *:text-center",
);

/** A card label whose tint follows a nested input's checked or mixed state. */
export const choiceCard = cv({
  extend: [button, focusWithin],
  class: [
    // Let slots read the nested input's disabled state.
    "group/choice",
    // A click can't change a checked radio card, so hover doesn't light it. It
    // keeps its selected offset, which the hover state would otherwise replace.
    "ui-settled:ui-hover:ak-state-(--selected-offset,0)",
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
    "ui-disabled-within:ui-hover:ak-ink-0",
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
    $rounded(defaultValue, variants) {
      if (isSegmentedKind(variants.$kind)) return defaultValue;
      return "xl";
    },
    $p(defaultValue, variants) {
      if (isSegmentedKind(variants.$kind)) return defaultValue;
      return 3;
    },
    $gapY(defaultValue, variants) {
      if (isSegmentedKind(variants.$kind)) return defaultValue;
      return "card";
    },
    $border: true,
    $darkEdgeWeight(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (isSegmentedKind(variants.$kind)) return defaultValue;
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
    $focusOffset(defaultValue, variants) {
      if (isSegmentedKind(variants.$kind)) return defaultValue;
      return 2;
    },
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
  refine({ variants, setVariants, addClass }) {
    addClass(
      isSegmentedKind(variants.$kind) ? choiceCardSegment : choiceCardSurface,
    );
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
    // The switch keeps its own motion.
    if (variants.$mark === "switch") return;
    addClass([
      // The mark starts once the check has mostly grown.
      "motion-safe:ui-choice-on:after:delay-100",
      // The check shrinks as a whole, so the mark stays until it's gone instead
      // of hiding when the state changes. The mask keeps a mixed check's dash
      // from turning into a check on the way out.
      "motion-safe:not-ui-choice-on:after:transition-[clip-path,mask-image,scale]",
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

// The gaps between the items of a list or a grid other than `auto`, with the
// keywords of a control group.
const choiceItemsGap = {
  none: "[:where(&)]:gap-0",
  xs: "[:where(&)]:gap-0.5",
  sm: "[:where(&)]:gap-1",
  md: "[:where(&)]:gap-2",
  lg: "[:where(&)]:gap-3",
  xl: "[:where(&)]:gap-4",
};

/** A responsive grid of choice cards with equal row heights. */
export const choiceCardGrid = cv({
  class: [
    "choice-card-grid grid auto-rows-fr",
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
    /**
     * Sets the gap between the cards. `auto` takes two thirds of the gap of the
     * choice group around the grid, so the group label stays further from the
     * cards than they are from each other. Zero specificity lets caller gap
     * classes win.
     * @default "auto"
     */
    $gap: {
      // Outside a group, use the group gap of cards.
      auto: "[:where(&)]:gap-[calc(var(--choice-group-gap,--spacing(4))*2/3)]",
      ...choiceItemsGap,
    },
  },
  defaultVariants: {
    $minItemSize: "10rem",
    $gap: "auto",
  },
});

/**
 * A labeled group of choice fields or cards, such as a radio group or a
 * fieldset of checkboxes. It stacks its label, its description, its items, and
 * its error with the group gap. Put the items in a `choiceList` or a
 * `choiceCardGrid`, whose gap spaces only the items. Caller classes can replace
 * the layout, such as to put a label that isn't a legend on the row of the
 * items.
 */
export const choiceGroup = cv({
  class: [
    // The label and the description read the disabled state of the group.
    "choice-group group/choice-group min-w-0",
    // The label covers the gap with its padding, as in a field.
    "[--_field-gap:var(--choice-group-gap)] gap-(--choice-group-gap)",
    // Zero specificity lets caller layout classes win.
    "[:where(&)]:flex [:where(&)]:flex-col",
  ],
  variants: {
    /**
     * Sets the gap between the label, the items, and the texts of the group.
     * Each size gives one spacing step more to a group that holds cards or
     * fields with descriptions, which have more weight. For example, `md` is
     * three spacing steps for simple fields and four for cards. A list or a
     * grid of items with an `auto` gap takes two thirds of it, so the label
     * stays further from the items than they are from each other.
     * @default "md"
     */
    $gap: {
      none: "[--choice-group-gap:0px]",
      xs: [
        "[--choice-group-gap:--spacing(1)]",
        "has-[.choice-card,.control-description]:[--choice-group-gap:--spacing(2)]",
      ],
      sm: [
        "[--choice-group-gap:--spacing(2)]",
        "has-[.choice-card,.control-description]:[--choice-group-gap:--spacing(3)]",
      ],
      md: [
        "[--choice-group-gap:--spacing(3)]",
        "has-[.choice-card,.control-description]:[--choice-group-gap:--spacing(4)]",
      ],
      lg: [
        "[--choice-group-gap:--spacing(4)]",
        "has-[.choice-card,.control-description]:[--choice-group-gap:--spacing(5)]",
      ],
      xl: [
        "[--choice-group-gap:--spacing(5)]",
        "has-[.choice-card,.control-description]:[--choice-group-gap:--spacing(6)]",
      ],
    },
  },
  defaultVariants: {
    $gap: "md",
  },
});

/**
 * Visible label of a choice group, placed first in the group. It has the same
 * text style as an input label. A `legend` stays above its fieldset's content,
 * also when caller classes change the layout of the group.
 */
export const choiceGroupLabel = cv({
  extend: [controlFieldLabel],
  class: [
    "choice-group-label",
    // A legend is drawn above the fieldset's content, out of its flex layout,
    // so the group gap doesn't follow it. Its bottom padding makes the gap
    // instead. WebKit ignores a float on a flex child, so floating the legend
    // into the layout doesn't work there.
    "[legend&]:mb-0",
    // Chromium sizes a legend to its text, so it would overflow a narrow group
    // instead of truncating. Fill the width, like a label in the flex layout.
    "[legend&]:w-full",
    // A disabled fieldset or radio group dims its label. Forced colors replace
    // the ink with the normal text color, so use the system disabled color.
    "group-ui-disabled/choice-group:ak-ink-0",
    "group-ui-disabled/choice-group:forced-colors:text-[GrayText]",
  ],
});

/**
 * Secondary text of a choice group, such as a hint about all of its items.
 * Right after the label, it sits close under it, and the group gap follows it.
 * Elsewhere in the group, the group gap spaces it, like the hint of a field.
 */
export const choiceGroupDescription = cv({
  extend: [controlFieldDescription],
  class: [
    "choice-group-description",
    // Pull the text from the group gap up to a small gap under the label. The
    // padding of a legend makes the gap, so the margin also works there. The
    // field gap holds the group gap resolved in the group's font, which is
    // larger than this text.
    "[.choice-group-label+&]:-mt-[calc(var(--_field-gap)-(--spacing(1)))]",
    "group-ui-disabled/choice-group:ak-ink-0",
    "group-ui-disabled/choice-group:forced-colors:text-[GrayText]",
  ],
});

/**
 * Stacks the fields or cards of a choice group. It adds no role. Its gap spaces
 * only the items, so the group label keeps the group gap.
 */
export const choiceList = cv({
  // Zero specificity lets caller layout classes win.
  class: "choice-list min-w-0 [:where(&)]:flex [:where(&)]:flex-col",
  variants: {
    /**
     * Sets the gap between the items. `auto` takes two thirds of the gap of the
     * choice group around the list, so the group label stays further from the
     * items than they are from each other. Zero specificity lets caller gap
     * classes win.
     * @default "auto"
     */
    $gap: {
      // Outside a group, use the group gap of simple fields.
      auto: "[:where(&)]:gap-[calc(var(--choice-group-gap,--spacing(3))*2/3)]",
      ...choiceItemsGap,
    },
  },
  defaultVariants: {
    $gap: "auto",
  },
});
