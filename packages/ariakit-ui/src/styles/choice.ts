import { cv, cx } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import {
  button,
  buttonContent,
  buttonDescription,
  buttonLabel,
  buttonSlot,
} from "./button.ts";
import { checkMark } from "./check-mark.ts";
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

const disabledWithinDescendants = cx(
  "ui-choice-disabled-within-descendants",
  // Stays a class, so that another class here that sets the color still comes
  // after it and replaces it.
  "[@container_style(--choice-disabled:1)]:[&&_*]:ak-ink-0",
  // Stays a class to come after another class here that sets the color, which
  // it replaces.
  "forced-colors:[@container_style(--choice-disabled:1)]:[&&_*]:text-[GrayText]",
);

// The box radius wins over the radius that a slot computes for floating slots.
// The switch mark can't set it in the same object, so it replaces this value in
// its computed default.
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
  extend: [choiceBase, checkMark],
  class: [
    "ui-choice",
    // The mark then inherits the box's text color from before forced colors,
    // which can match the canvas. Set the system text color for it to inherit.
    // Stays a class to come after the color of `ink`, which it replaces.
    "forced-colors:text-[CanvasText]",
    // A child reads the state of the box with a style query, because a :has()
    // in ui-choice-off before the child selector would make Chrome restyle
    // whole subtrees. See disabledWithinDescendants.
    // Stays a class to keep its order with the classes of the elements that it
    // styles.
    "*:[@container_style(--choice-off:1)]:hidden!",
    // The selected fill keeps the brand color on every surface. Like the empty
    // box, a neutral edge keeps the 3:1 boundary. It has no alpha of its own,
    // so it stays faint or hidden where the fill already passes the floor. The
    // plugin's zero-lighten utility cancels the default lightening stored in
    // the style attribute.
    // Stays a class with the other `ui-choice-on:ak-layer-*` classes, which
    // come after the layer classes of the control and replace them.
    "ui-choice-enabled:ui-choice-on:ak-layer-brand",
    // Stays a class to come after the --_ak-layer-idle-relative-lightness of
    // `layer`, which it replaces.
    "ui-choice-on:ak-layer-lighten-0",
    // A disabled checked mark draws its edge in the color of its faded fill.
    // Stays a class to come after another class here that sets the
    // --_ak-edge-alpha, which it replaces.
    "ui-choice-disabled:ui-choice-on:ak-edge-raw",
    // The selected fill keeps its color; the chroma cap is for the raised box.
    // Stays a class to come after the --_ak-layer-chroma-max of `layer`, which
    // it replaces.
    "ui-choice-on:ak-layer-max-c-[initial]",
    // Keep disabled marks and empty boxes distinct on light surfaces.
    // Stays a class with the other `ui-choice-on:ak-layer-*` classes, which
    // come after the layer classes of the control and replace them.
    "ui-choice-disabled:ui-choice-on:ak-layer-15",
    // Stays a class to come after the --_ak-text-alpha of `ink`, which it
    // replaces.
    "ui-choice-disabled:ak-ink-0",
    // Stays a class to come after the --_ak-edge-alpha of `edge`, which it
    // replaces.
    "ui-choice-disabled:ak-edge-20",
    // Forced colors replace the ink and edge with the normal text color. Use
    // the system disabled color for the mark and the box. A native input needs
    // the edge rule in Chromium; other hosts follow the text color.
    // Stays a class to come after the color of `ink`, which it replaces.
    "ui-choice-disabled:forced-colors:text-[GrayText]",
    // Stays a class to come after the border-color of `floatingClass`, which it
    // replaces.
    "ui-choice-disabled:forced-colors:border-[GrayText]",
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
      // The check mark style recipe draws the check with the layer's readable
      // text color.
      check: [
        "ui-choice--mark-check",
        // Stays a class to come after the off-state transition classes of the
        // floating check, which it replaces. Safari also applies those
        // `ui-choice-off` classes to the `::after` of a checked choice, so the
        // order decides.
        "motion-safe:ui-choice-on:after:transition-[clip-path]",
        "motion-safe:ui-choice-on:after:duration-150",
        "motion-safe:ui-choice-on:after:ease-linear",
      ],
      dot: [
        "ui-choice--mark-dot",
        // Only the on state sets these, so unchecking is immediate.
        // Stays a class to come after the off-state transition classes of the
        // floating check, which it replaces. Safari also applies those
        // `ui-choice-off` classes to the `::after` of a checked choice, so the
        // order decides.
        "motion-safe:ui-choice-on:after:transition-[scale]",
        "motion-safe:ui-choice-on:after:duration-150",
        "motion-safe:ui-choice-on:after:ease-in-out",
      ],
      switch: "ui-choice--mark-switch",
    },
  },
  defaultVariants: {
    $mark: "check",
    $roundBox(defaultValue, variants) {
      if (variants.$mark !== "check") return defaultValue;
      return variants.$rounded === "full";
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
  class: "ui-choice-input",
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
    "group/choice-field ui-choice-field",
    // Stays a class to come after the content of `ui-control`, which it
    // replaces.
    "justify-start",
    // Group-disabled inputs may not pass $disabled to the row. Read their DOM
    // state and dim descendants, including independently colored descriptions.
    "ui-disabled-within:ak-disabled",
    // Stays a class, so that another class here that sets the color still comes
    // after it and replaces it.
    "ui-disabled-within:ak-ink-0",
    disabledWithinDescendants,
    // An adaptive text color on the row or an ancestor targets nested text
    // with higher specificity. The ui-text rules here and in forced colors set
    // the disabled color on the same targets.
    // https://github.com/ariakit/ariakit/issues/7869
    "ui-disabled-within:not-forced-colors:ui-text:ak-ink-0",
    "ui-disabled-within:forced-colors:ui-text:text-[GrayText]",
    // Forced colors replace the ink with the normal text color. Use the system
    // disabled color instead.
    // Stays a class to come after another class here that sets the color, which
    // it replaces.
    "ui-disabled-within:forced-colors:text-[GrayText]",
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

const choiceCardSurface = cx(
  // Choice groups give cards more room than simple fields.
  "ui-choice-card--surface",
  // Allow a direct description to occupy its own row.
  "flex-wrap",
  // Stays a class to come after the content of `ui-control`, which it
  // replaces.
  "justify-start",
  // Stays a class to come after the --_ak-layer-color of `segmentBase`, which
  // it replaces.
  "not-ui-disabled-within:ui-checked-within:ak-layer-brand",
  // Stays a class with another class here that sets the same property, so
  // Tailwind keeps their order.
  "not-ui-disabled-within:ui-checked-within:ak-layer-mix-20",
  // Stays a class to come after the --_ak-layer-color of `segmentBase`, which
  // it replaces.
  "not-ui-disabled-within:ui-mixed-within:ak-layer-brand",
  // Stays a class with another class here that sets the same property, so
  // Tailwind keeps their order.
  "not-ui-disabled-within:ui-mixed-within:ak-layer-mix-20",
  // Use the plugin's zero-lighten utility to cancel the default inline
  // channel.
  // Stays a class with another class here that sets the same property, so
  // Tailwind keeps their order.
  "not-ui-disabled-within:ui-checked-within:ak-layer-lighten-0",
  "not-ui-disabled-within:ui-mixed-within:ak-layer-lighten-0",
  // Forced colors remove shadows. Use a real border one pixel wider instead.
  // Stays a class to come after the classes of a caller, so that the forced
  // colors rule still applies.
  "not-has-[.ui-choice-card-check]:ui-checked-within:forced-colors:ak-frame-border-[length:calc(var(--border-width,1px)+1px)]",
  "not-has-[.ui-choice-card-check]:ui-mixed-within:forced-colors:ak-frame-border-[length:calc(var(--border-width,1px)+1px)]",
);

const choiceCardSegment = cx(
  "ui-choice-card--segment",
  // Stays a class to come after the flex-grow that the control gives its
  // label, which it replaces.
  "*:grow-0",
  // Stays a class to keep its order with the classes of the elements that it
  // styles.
  "*:text-center",
);

/** A card label whose tint follows a nested input's checked or mixed state. */
export const choiceCard = cv({
  extend: [button, focusWithin],
  class: [
    // Let slots read the nested input's disabled state.
    "group/choice ui-choice-card",
    // A click can't change a checked radio card, so hover doesn't light it. It
    // keeps its selected offset, which the hover state would otherwise replace.
    "ui-settled:ui-hover:ak-state-(--selected-offset,0)",
    // Group-disabled cards may not receive $disabled. Read the input state and
    // suppress hover and press on the label too.
    "ui-disabled-within:ak-disabled ui-disabled-within:ak-ink-0",
    disabledWithinDescendants,
    // An adaptive text color on the card or an ancestor targets nested text
    // with higher specificity. The ui-text rules here and in forced colors set
    // the disabled color on the same targets.
    // https://github.com/ariakit/ariakit/issues/7869
    "ui-disabled-within:not-forced-colors:ui-text:ak-ink-0",
    "ui-disabled-within:ak-layer-fade-80",
    // Forced colors replace the ink with the normal text color. Use the system
    // disabled color instead; the label's edge follows the text color. It's
    // important because hover and selected ink rules are more specific.
    // Stays a class to come after the color of `ui-control-disabled`, which it
    // replaces.
    "ui-disabled-within:forced-colors:text-[GrayText]!",
    // Stays a class to come after the color of `ui-choice-card`, which it
    // replaces.
    "ui-disabled-within:forced-colors:ui-text:text-[GrayText]",
    // Stays a class to come after the hover state of `hover`, which it replaces
    // in a disabled choice.
    "ui-disabled-within:ui-hover:ak-state-0",
    // Stays a class to come after the hover ink of `hover`, which it replaces
    // in a disabled choice.
    "ui-disabled-within:ui-hover:ak-ink-0",
  ],
  variants: {
    /**
     * Sets the card flow. `vertical` puts the slot and check above full-width
     * content and removes their inline margins. It also rounds nested `$cover`
     * frames for a column.
     */
    $orientation: {
      vertical: [
        "ui-choice-card--orientation-vertical",
        // Override the control's reset of this flag on direct children.
        // Stays a class to keep its order with the classes of the elements that
        // it styles.
        "*:[--control-inline:0]!",
      ],
    },
    /**
     * Sets the vertical gap between the element's label and description.
     * @default "card"
     */
    $gapY: {
      // Share the smaller wrapped-row gap with the content wrapper.
      card: [
        "[--gap-y:calc(var(--py)/2)]",
        // Stays a class to come after the gap of `slotFrame`, which it
        // replaces.
        "gap-y-(--gap-y)",
      ],
    },
    /** Applies disabled styles while keeping a faint card boundary. */
    $disabled: "ui-choice-card--disabled ak-edge-5",
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

// A floating check hides when its card is unchecked, and it grows and shrinks
// the same way on every corner. The $floating keys below must follow the
// corners of slotFrameSlot, or a check on a missing corner never hides.
const floatingCheckClass = [
  "ui-choice-off:scale-0",
  // The whole check grows from its center. The scale property is separate
  // from translate, so the check stays on the corner.
  "motion-safe:ui-choice-on:transition-[scale]",
  "motion-safe:ui-choice-on:duration-(--duration-overshoot)",
  "motion-safe:ui-choice-on:ease-overshoot",
  // While the check grows, the browser draws it on a layer of its own. If
  // the layer went away when the check stopped, the check would move to
  // the nearest pixel, so it keeps the layer while it shows.
  "motion-safe:ui-choice-on:will-change-[scale]",
  // The state changes the colors at once. Hold them until the check has
  // shrunk.
  "motion-safe:ui-choice-off:transition-[scale,background-color,color]",
  "motion-safe:ui-choice-off:duration-150",
  "motion-safe:ui-choice-off:ease-[var(--ease-in-out),step-end,step-end]",
];

/**
 * A card check indicator whose state follows the nested input. A child replaces
 * the drawn mark.
 */
export const choiceCardCheck = cv({
  extend: [choice],
  // Cards without this mark draw a second edge pixel when selected.
  class: "ui-choice-card-check",
  variants: {
    /**
     * Places the check on a corner of the card and hides it when unchecked.
     * `true` is the top-end corner. `start` and `end` follow the text
     * direction.
     */
    $floating: {
      true: floatingCheckClass,
      "top-start": floatingCheckClass,
      "top-end": floatingCheckClass,
      "bottom-start": floatingCheckClass,
      "bottom-end": floatingCheckClass,
    },
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
      "motion-safe:ui-choice-off:after:transition-[clip-path,mask-image,scale]",
      "motion-safe:ui-choice-off:after:transition-discrete",
      "motion-safe:ui-choice-off:after:duration-0",
      "motion-safe:ui-choice-off:after:delay-150",
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
  variants: {
    $grow: "ui-choice-card-label--grow",
  },
  defaultVariants: {
    $grow: true,
  },
});

/** Secondary choice card text that truncates by default. */
export const choiceCardDescription = buttonDescription;

// The gaps between the items of a list or a grid other than `auto`, with the
// keywords of a control group.
const choiceItemsGap = {
  none: "ui-base:gap-0",
  xs: "ui-base:gap-0.5",
  sm: "ui-base:gap-1",
  md: "ui-base:gap-2",
  lg: "ui-base:gap-3",
  xl: "ui-base:gap-4",
};

/** A responsive grid of choice cards with equal row heights. */
export const choiceCardGrid = cv({
  class: "ui-choice-card-grid",
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
      auto: "ui-choice-card-grid--gap-auto",
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
  class: "group/choice-group ui-choice-group",
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
      xs: "ui-choice-group--gap-xs",
      sm: "ui-choice-group--gap-sm",
      md: "ui-choice-group--gap-md",
      lg: "ui-choice-group--gap-lg",
      xl: "ui-choice-group--gap-xl",
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
    "ui-choice-group-label",
    // A disabled fieldset or radio group dims its label. Forced colors replace
    // the ink with the normal text color, so use the system disabled color.
    // Stays a class, so that another class here that sets the color still comes
    // after it and replaces it.
    "group-ui-disabled/choice-group:ak-ink-0",
    // Stays a class to come after another class here that sets the color, which
    // it replaces.
    "group-ui-disabled/choice-group:forced-colors:text-[GrayText]",
  ],
});

/**
 * Secondary text of a choice group, such as a hint about all of its items.
 * Right after the label, it sits close under it, never further than the group
 * gap, and the group gap follows it. Elsewhere in the group, the group gap
 * spaces it, like the hint of a field.
 */
export const choiceGroupDescription = cv({
  extend: [controlFieldDescription],
  class: [
    "ui-choice-group-description",
    // Stays a class, so that another class here that sets the color still comes
    // after it and replaces it.
    "group-ui-disabled/choice-group:ak-ink-0",
    // Stays a class to come after another class here that sets the color, which
    // it replaces.
    "group-ui-disabled/choice-group:forced-colors:text-[GrayText]",
  ],
});

/**
 * Stacks the fields or cards of a choice group. It adds no role. Its gap spaces
 * only the items, so the group label keeps the group gap.
 */
export const choiceList = cv({
  class: "ui-choice-list",
  variants: {
    /**
     * Sets the gap between the items. `auto` takes two thirds of the gap of the
     * choice group around the list, so the group label stays further from the
     * items than they are from each other. Zero specificity lets caller gap
     * classes win.
     * @default "auto"
     */
    $gap: {
      auto: "ui-choice-list--gap-auto",
      ...choiceItemsGap,
    },
  },
  defaultVariants: {
    $gap: "auto",
  },
});
