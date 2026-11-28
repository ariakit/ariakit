import type { VariantProps } from "clava";
import { cv, cx } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { frame } from "./frame.ts";
import { hasLayerBackground, isLayerColor, layer } from "./layer.ts";
import { segmentGroup } from "./segment.ts";
import {
  hasSlotSurface,
  slotFrame,
  slotFrameContent,
  slotFrameSlot,
  slotFrameText,
} from "./slot-frame.ts";
import { text } from "./text.ts";

/**
 * Checks whether a disabled control fades its surface into the parent layer, so
 * that a colored or inverted surface does not look enabled. Neutral fills,
 * including canvas, stay because they can be the control's only boundary.
 */
export function fadesDisabledSurface(variants: VariantProps<typeof layer>) {
  if (variants.$invert) return true;
  if (!isLayerColor(variants.$layer)) return false;
  return variants.$layer !== "canvas";
}

/**
 * Disabled control styles. They follow the DOM disabled state and the
 * `ui-disabled` class that `$disabled` adds, which also stops hover and press
 * styles.
 */
export const controlDisabledClass = cx(
  "ui-control-disabled",
  // Forced colors replace the ink with the normal text color. Use the system
  // disabled color, also on descendants that set their own color.
  // Stays a class to come after the classes of a caller, so that the forced
  // colors rule still applies.
  "ui-disabled:forced-colors:text-[GrayText]!",
  "ui-disabled:forced-colors:**:text-[GrayText]!",
  "ui-disabled:forced-colors:border-[GrayText]!",
);

/** Shared layout, text spacing, and disabled styles for controls. */
export const control = cv({
  extend: [slotFrame],
  class: [
    "ui-control ak-frame-join-item group/control",
    // Only the items of a stretched group take its side padding, not the badges
    // and controls inside their slots.
    // Stays a class to keep its order with the classes of the elements that it
    // styles.
    "*:[--stretch-px-scale:initial]",
  ],
  variants: {
    /**
     * Shows the element as disabled, as the DOM disabled state does. It doesn't
     * disable the element or set `aria-disabled`.
     */
    $disabled: ["ui-disabled", controlDisabledClass],
  },
  defaultVariants: {
    $rounded: "md",
    $p: 2,
  },
  refine({ variants, setVariants }) {
    // The fade applies after the lightness push, so it also dims an inverted
    // surface, whose push always reaches a lightness bound. Extenders fade the
    // same surfaces for their DOM disabled state.
    if (!variants.$disabled) return;
    if (!fadesDisabledSurface(variants)) return;
    setVariants({ $fade: 80 });
  },
});

/**
 * Returns the classes that fade painted content inside a disabled control, such
 * as a badge or a slot, by the rule of the control's own surface: a colored or
 * inverted surface fades, a neutral fill stays, and images fade.
 */
export function getDisabledContentClass(variants: VariantProps<typeof layer>) {
  // An input group is disabled through its entry controls, so its rules leave
  // out the content of an enabled action button in the group.
  const classes = [
    // Fade image pixels only; fading the whole element would reduce text
    // contrast. DOM disabled state can change without rerendering the recipe.
    "group-ui-disabled/control:[&_img]:opacity-50",
    "group-ui-disabled-within/choice:[&_img]:opacity-50",
    "group-ui-field-disabled/control:[&_img:not(:is(button,input,a):not(:disabled,[aria-disabled='true'])_*)]:opacity-50",
  ];
  // Without a fill, the content takes the text color of the control.
  if (!hasLayerBackground(variants)) return classes;
  classes.push(
    // A fill sets its own text color, which the control's direct-child text
    // rules may not reach. A disabled input group sets the ink on its
    // descendants itself, except in forced colors.
    "group-ui-disabled/control:ak-ink-0",
    "group-ui-disabled-within/choice:ak-ink-0",
  );
  if (!fadesDisabledSurface(variants)) return classes;
  classes.push(
    // Fade the disabled surface before calculating readable text contrast.
    "group-ui-disabled/control:ak-layer-fade-80",
    "group-ui-disabled-within/choice:ak-layer-fade-80",
    "not-[:is(button,input,a):not(:disabled,[aria-disabled='true'])_*]:group-ui-field-disabled/control:ak-layer-fade-80",
    // An edge can follow the surface color, so it would still look enabled.
    "group-ui-disabled/control:ak-edge-5",
    "group-ui-disabled-within/choice:ak-edge-5",
    "not-[:is(button,input,a):not(:disabled,[aria-disabled='true'])_*]:group-ui-field-disabled/control:ak-edge-5",
  );
  return classes;
}

/**
 * A slot in a control. Its painted content fades while the control is disabled,
 * like the control's own surface, and the keys in it fade and mute their text.
 */
export const controlSlot = cv({
  extend: [slotFrameSlot],
  class: "ui-control-slot",
  refine({ variants, addClass }) {
    addClass(getDisabledContentClass(variants));
  },
});

/**
 * A flexible wrapper for a control's label and description. It starts its text,
 * also in a control that centers its content, such as a button.
 */
export const controlContent = cv({
  extend: [slotFrameContent],
  class: "ui-control-content group/control-content text-start",
});

/**
 * A row in a control's content for the label and the slots that go with it,
 * such as a badge. The description then takes the full width below the row, and
 * a slot wraps below the label when the row runs out of room.
 */
export const controlLabelRow = cv({
  class: "ui-control-label-row flex-wrap",
});

/**
 * Control label text with optional single-line truncation. Row labels such as
 * navigation and disclosure labels grow by default.
 */
export const controlLabel = cv({
  extend: [slotFrameText],
  class: "ui-control-label group-ui-disabled/control:ak-ink-0",
});

/**
 * Secondary control text with optional truncation or line limits. Its font size
 * defaults to `0.875` of the label, with the line height of smaller text.
 */
export const controlDescription = cv({
  extend: [text],
  class: [
    // Let the active style recipe reduce press depth for controls with
    // descriptions.
    "ui-control-description font-normal",
    "group-ui-disabled/control:ak-ink-0",
  ],
  variants: {
    /** Truncates the description to one line with an ellipsis. */
    $truncate: "truncate",
    /**
     * Limits the description to this number of lines. `false` removes a default
     * limit.
     */
    $lineClamp(value?: number | false) {
      if (!value) return;
      return {
        style: { "--line-clamp": `${value}` },
        class: "line-clamp-(--line-clamp)",
      };
    },
  },
  defaultVariants: {
    // Smaller text than the label. A number keeps the size relative to the
    // label and gives the line height of smaller text, also where a parent sets
    // its line height as a length, such as a list row.
    $size: 0.875,
    $ink: 70,
  },
});

/**
 * A field that stacks a label above a control and the control's error and
 * hints, or puts the label in a start column. The parts only add styles:
 * connect the label with `htmlFor`, and the texts with the control's
 * `aria-describedby`.
 */
export const controlField = cv({
  class: [
    "group/field ui-control-field",
    // Fields inside this one start their own columns.
    // Stays a class to keep its order with the classes of the elements that it
    // styles.
    "*:[--field-columns:initial]",
  ],
  variants: {
    /**
     * Stacks the parts, or puts the label in a start column. A horizontal field
     * holds the control and its texts in a `controlFieldContent`. In a
     * `controlFieldGrid`, it shares the label column with the other fields, so
     * the column fits the longest label, and it stacks in a narrow grid. On its
     * own, the label column fits its own label.
     * @default "vertical"
     */
    $orientation: {
      vertical: "flex flex-col",
      horizontal: [
        "ui-control-field--orientation-horizontal",
        // In a narrow field grid, the label and the content take full rows.
        // Stays a class to keep its order with the classes of the elements that
        // it styles.
        "@max-[20rem]/field-grid:*:col-span-full",
      ],
    },
    /**
     * Aligns the label text in its column. Horizontal fields default to `end`,
     * which keeps short labels next to the control. A label above the control,
     * including one in a stacked field grid, aligns to the start.
     */
    $labelAlign: {
      start: "",
      end: "ui-control-field--label-align-end",
    },
  },
  defaultVariants: {
    $orientation: "vertical",
    $labelAlign(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$orientation === "horizontal") return "end";
      return "start";
    },
  },
});

/**
 * Lines up horizontal fields in shared columns, so the label column fits the
 * longest label. Fields stack in a grid narrower than `20rem`. The grid fills
 * the width of its container, because its content can't size it. In a container
 * that fits its content, such as a popover, give the grid a width. Only direct
 * field children share the columns. Other children, such as a heading, take a
 * full row, and fields inside them use their own columns.
 */
export const controlFieldGrid = cv({
  class: "ui-control-field-grid",
});

/**
 * Holds a field's control, error, and hints in the second column of a
 * horizontal field. Optional in a stacked field.
 */
export const controlFieldContent = cv({
  class: "ui-control-field-content flex-col",
});

/**
 * Label text above or beside a field's control. The labels of choice groups
 * extend it, so all labels in a form look the same.
 */
export const controlFieldLabel = cv({
  extend: [text],
  class: [
    "ui-control-field-label",
    // ui-field-disabled reads the field's entry controls, including updates
    // after render.
    // Stays a class, so that another class here that sets the color still comes
    // after it and replaces it.
    "group-ui-field-disabled/field:ak-ink-0",
    // Forced colors replace the ink with the normal text color. Use the system
    // disabled color instead.
    // Stays a class to come after another class here that sets the color, which
    // it replaces.
    "group-ui-field-disabled/field:forced-colors:text-[GrayText]",
  ],
  variants: {
    /** Truncates the label to one line with an ellipsis. */
    $truncate: "truncate",
  },
});

/** Hint text for a field's control. */
export const controlFieldDescription = cv({
  extend: [text],
  class: [
    "ui-control-field-description ui-base:text-[0.875em]",
    "group-ui-field-disabled/field:ak-ink-0",
  ],
  defaultVariants: {
    $ink: 70,
  },
});

/**
 * Error text for a field's control. While it has text, list its id first in the
 * control's `aria-describedby` and set `aria-invalid` on the control. Put the
 * text in a `controlFieldErrorText` part, which takes the danger color, and put
 * a `controlFieldErrorIcon` part before it to mark the error with an icon.
 * Frame variants, such as `$layer`, `$rounded`, and `$p`, show the error on a
 * panel. A fill or a border pads and rounds the panel by default. While the
 * error is empty, with no child nodes, the panel is visually hidden, but it
 * stays in the accessibility tree, so a live region keeps working. Set
 * `--field-error-icon-size` and `--field-error-icon-gap` on the error or an
 * ancestor to change the icon size and the space after it.
 */
export const controlFieldError = cv({
  extend: [slotFrame],
  class: "ui-control-field-error ui-base:text-[0.875em]",
  variants: {
    /**
     * Sets the gap between the icon and the text. `auto` uses
     * `--field-error-icon-gap`. Without padding, the fallback is the `md` gap
     * of a slot frame without padding at the size of the field text, so the
     * text lines up with the label of a checkbox or radio field. With padding,
     * the fallback is the icon's distance from the top edge, less one step of
     * the gap scale, like the space after the icon of a control, and at least
     * `0.375em`. Side padding beyond `md` widens it by the same amount.
     */
    $gap: {
      // The refine picks the gap for the padding.
      auto: "",
    },
  },
  defaultVariants: {
    $text: "danger",
    $gap: "auto",
    $p(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // A fill or a border draws a panel, which needs space around the text.
      if (hasSlotSurface(variants)) return 2;
      return "none";
    },
    $rounded(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (!hasSlotSurface(variants)) return defaultValue;
      // Match the corners of the field above.
      return "lg";
    },
  },
  refine({ variants, addClass }) {
    const padded = variants.$p !== "none";
    // An empty panel would still paint its box, for example while an alert
    // waits for its text. sr-only keeps the alert in the accessibility tree,
    // where display: none would remove it.
    if (hasSlotSurface(variants)) {
      addClass("empty:sr-only");
    }
    // The custom property is read with a fallback and never set here, so a
    // value on the error or an ancestor always wins. The fallback size matches
    // the one in the icon part. The icon has no margin on the text side, so the
    // side padding beyond md widens the gap once, like the room after a slot in
    // other rows.
    if (variants.$gap === "auto" && padded) {
      addClass(
        "[--gap:var(--field-error-icon-gap,calc(max(0.375em,calc(var(--py)+(1lh-var(--field-error-icon-size,1.125em))/2-var(--gap-step)))+var(--px-extra)))] gap-(--gap)",
      );
    }
    // Without padding, slotFrame starts the icon at the edge, like a list
    // bullet, so it lines up with the field label and hints. A panel moves the
    // icon into its side padding, like the slots of a control. The error text
    // is 0.875em, so scale the gap back to the size of the field text.
    if (variants.$gap === "auto" && !padded) {
      addClass(
        "[--gap:var(--field-error-icon-gap,calc(var(--flush-gap)/0.875))] gap-(--gap)",
      );
    }
  },
});

/**
 * An icon before the text of a field error, centered on its first line. Hide it
 * from assistive technology, because the error text tells the same thing.
 */
export const controlFieldErrorIcon = cv({
  extend: [slotFrameSlot],
  class: [
    "ui-control-field-error-icon",
    // The custom property is read with a fallback and never set here, so a
    // value on the error or an ancestor always wins. Stays a class to come
    // after the --size of `slotSizeClasses`, which it replaces.
    "[--size:var(--field-error-icon-size,1.125em)]",
    // A panel pulls the icon into its side padding only at the start, so the
    // error's gap is the whole space after the icon. Tailwind emits me-* after
    // mx-*, so this margin wins.
    // Stays a class to come after the margin of `slotFrameSlot`, which it
    // replaces.
    "me-0",
    // Chromium paints an inline SVG in the system text color already. The
    // system color keeps currentColor right where SVG colors aren't forced.
    // Stays a class to come after the color of `ink`, which it replaces.
    "forced-colors:text-[CanvasText]",
  ],
  variants: {
    /**
     * Disables the inherited variant; `--field-error-icon-size` sets the icon
     * size.
     */
    $size: null,
  },
});

/**
 * The text of a field error, after its icon. Wrapped lines start under the
 * first line's text, and links and other inline children stay in its line of
 * text.
 */
export const controlFieldErrorText = cv({
  extend: [text],
  // Fill the row, so an inherited text-align still moves the text.
  class: "ui-control-field-error-text",
});

const separatorEdge = cx(
  "ui-control-separator--edge ak-edge-alpha-[calc((24-var(--width)*6)/100)]",
);

/** A line, slash, or chevron between horizontal controls. */
export const controlSeparator = cv({
  extend: [layer],
  class: [
    "ui-control-separator",
    // Resolve the separator edge against a layer without painting a background.
    // Stays a class to come after the background-color of `layer`, which it
    // replaces.
    "bg-transparent",
  ],
  variants: {
    /** Sets the separator shape: a line, slash, or chevron. */
    $kind: {
      pipe: "rounded-full",
      slash: "ui-control-separator--kind-slash",
      chevron: "ui-control-separator--kind-chevron",
    },
    /**
     * Sets the separator height. `lg` fills the row; `full` also covers group
     * padding. Chevrons use `md` for both.
     */
    $size: {
      xs: ["ui-control-separator--size-xs", separatorEdge],
      sm: ["ui-control-separator--size-sm", separatorEdge],
      md: ["ui-control-separator--size-md", separatorEdge],
      lg: "self-stretch",
      full: "ui-control-separator--size-full",
    },
    /**
     * Hides the separator beside hovered, selected, or keyboard-focused
     * controls, whose surfaces would touch it. `auto` hides it only when the
     * gap of the group leaves too little room, so a separator in a wide gap
     * stays. Separators outside a control group have no known gap, so `auto`
     * hides them too. `true` always hides it, and `false` never does. Chevrons
     * and `full` separators default to `false`.
     */
    $shy: {
      auto: "ui-control-separator--shy ui-control-separator--shy-auto",
      true: "ui-control-separator--shy [--separator-shy-opacity:0]",
    },
    /** Sets the separator's visual stroke width in pixels. */
    $width: {
      1: "[--width:1]",
      2: "[--width:2]",
      3: "[--width:3]",
    },
  },
  defaultVariants: {
    // Pin the edge color to the surrounding surface.
    $lightnessOffset: 0,
    $size: "md",
    $width: 1,
    $kind: "pipe",
    $shy(defaultValue, variants) {
      if (variants.$kind === "chevron") return defaultValue;
      if (variants.$size === "full") return defaultValue;
      return defaultValue ?? "auto";
    },
  },
  refine({ variants, setVariants }) {
    if (variants.$kind !== "chevron") return;
    if (variants.$size !== "lg" && variants.$size !== "full") return;
    setVariants({ $size: "md" });
  },
});

/**
 * The offset from a bar's control to the bar's near edge. Bars read the
 * distance from their control to the group's padding edge from `--bar-gap`, and
 * the width of an edge past it that an `edge` bar covers from `--bar-edge`.
 */
export type BarOffset = "halfway" | "edge" | (string & {}) | number;

const barOffsetClasses = {
  halfway: "[--bar-offset:calc((var(--bar-gap)-var(--bar))/2)]",
  edge: "[--bar-offset:calc(var(--bar-gap)+var(--bar-edge,0px)-var(--bar))]",
};

/** Checks whether a bar offset is `halfway` or `edge`. */
export function isNamedBarOffset(
  value: unknown,
): value is keyof typeof barOffsetClasses {
  if (typeof value !== "string") return false;
  return Object.hasOwn(barOffsetClasses, value);
}

/** Resolves a named bar offset into its `--bar-offset` class. */
export function getNamedBarOffsetClass(value: keyof typeof barOffsetClasses) {
  return barOffsetClasses[value];
}

/**
 * Checks whether a spacing or length bar offset is a negative number or starts
 * with a minus sign, which puts the bar over its control. The sign of a calc()
 * or var() value is known only after the browser resolves it.
 */
function isNegativeBarOffset(value: string | number) {
  if (typeof value === "number") return value < 0;
  return value.trimStart().startsWith("-");
}

/**
 * Resolves a named or spacing bar offset into `--bar-offset`. Negative numbers
 * and lengths that start with `-` also mark the bar with `ui-bar--over`.
 */
export function getBarOffset(value?: BarOffset) {
  if (value == null) return;
  if (isNamedBarOffset(value)) return getNamedBarOffsetClass(value);
  const style = { "--bar-offset": getSpacingValue(value) };
  if (!isNegativeBarOffset(value)) return { style };
  return { class: "ui-bar--over", style };
}

/** Shared painting and visibility for bars inside selected controls. */
export const controlBarBase = cv({
  extend: [layer],
  class: [
    "ui-bar ui-control-bar-base",
    // The bar floats over the edge of its control, so the rules that find the
    // first and last item of the row skip it by this class.
    "ui-slot-frame-floating",
    // A dark bar on a light layer looks thinner than a light bar on a dark
    // one, so it is wider by default. The bar paints on the surface around
    // its control, or on the control itself when it is over the control.
    "ak-outset-light:[--bar-width-auto:3px] ak-outset-dark:[--bar-width-auto:2px]",
    // Forced colors would repaint the fill with the canvas color.
    // Stays a class to come after the classes of a caller, so that the forced
    // colors rule still applies.
    "forced-colors:forced-color-adjust-none",
    // Stays a class to come after the background-color of `layer`, which it
    // replaces.
    "forced-colors:bg-[CanvasText]",
    // A bar outside a layered control paints on the surface around the
    // control, so it takes its color context from that surface. A negative
    // offset puts the bar over the control, so it keeps the control's context.
    "[.ak-layer>&:not(.ui-bar--over)]:ak-outset",
  ],
  variants: {
    /**
     * Sets the bar thickness. Numbers are pixels; other values are CSS lengths.
     * High contrast adds 20%. Defaults to 2px, or 3px on a light layer.
     */
    $width(value?: number | (string & {})) {
      if (value == null) return;
      const width = typeof value === "number" ? `${value}px` : value;
      return { style: { "--bar-width": width } };
    },
    /**
     * Sets the bar length along its control. `full` spans the control. `auto`
     * is shorter by the control's corner radius, half at each end, so rounder
     * controls get shorter bars.
     */
    $length: {
      full: "[--bar-inset:0px]",
      auto: "ui-control-bar-base--length-auto",
    },
  },
  defaultVariants: {
    $length: "auto",
    // Contrast with the surrounding surface instead of painting a cover.
    $layer: "transparent",
    $contrast: true,
    $invert(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // A color bar keeps its hue. Inverting would turn it into a pale tint.
      if (variants.$layer == null) return true;
      if (variants.$layer === true) return true;
      return variants.$layer === "transparent";
    },
  },
});

/**
 * A thin bar that marks a checked, selected, or current control. Render it as
 * the control's last child. Horizontal groups draw it below or above the
 * control; vertical groups draw it at the control's inline end or start.
 */
export const controlBar = cv({
  extend: [controlBarBase],
  class: "ui-control-bar",
  variants: {
    /** Places the bar after or before its control on the group's cross axis. */
    $side: {
      end: "ui-control-bar--side-end",
      start: "ui-control-bar--side-start",
    },
    /**
     * Sets the gap from the control to the bar. `edge` puts the bar on the
     * group's padding edge, and `halfway` centers it between the control and
     * that edge. Numbers scale the spacing token, so `0` puts the bar against
     * the control; other strings are CSS lengths. Defaults to `edge`.
     *
     * A bar outside the control contrasts with the surface around it. A
     * negative number or a length that starts with `-`, such as `-0.5` or
     * `-3px`, puts the bar over the control and makes it contrast with the
     * control instead. Other offsets keep the outside contrast even when they
     * put the bar over the control, which can hide the bar in high contrast
     * mode. This includes named offsets with padding thinner than the bar, and
     * `calc()` or `var()` values that resolve to a negative length. Use a
     * negative number or a length that starts with `-` there.
     */
    $offset: getBarOffset,
  },
  defaultVariants: {
    $side: "end",
    $offset: "edge",
  },
});

/** A control group with shared spacing and optional joined edges. */
export const controlGroup = cv({
  extend: [frame, segmentGroup, text],
  class: [
    "ui-control-group",
    // Forced colors remove the selected surface, which may be the only mark of
    // the checked control, so it keeps an edge. A control with an edge keeps
    // its own width.
    // Stays a class to come after the classes of a caller, so that the forced
    // colors rule still applies.
    "[&>.ui-control]:ui-selected:forced-colors:ak-frame-border-[length:max(1px,var(--border-width,1px))]",
  ],
  variants: {
    /**
     * Joins adjacent control edges in a single row or column with no gap.
     * Active controls own their shared edges; later active controls win ties.
     * Inner corners are square only when the group padding resolves to zero.
     */
    $joined: "",
    /**
     * Arranges controls in a row, column, wrapping row, or equal-width row.
     * `none` omits layout styles.
     */
    $layout: {
      none: "",
      wrap: "flex flex-wrap",
      stretch: "ui-control-group--layout-stretch",
      horizontal: "flex",
      vertical: "ui-vertical ui-control-group--layout-vertical flex-col",
    },
    /** Sets the gap between controls. `auto` uses the group padding. */
    $gap: {
      none: "[--group-gap:0px]",
      auto: "ui-control-group--gap-auto",
      xs: "ui-control-group--gap-xs",
      sm: "ui-control-group--gap-sm",
      md: "ui-control-group--gap-md",
      lg: "ui-control-group--gap-lg",
      xl: "ui-control-group--gap-xl",
    },
  },
  defaultVariants: {
    $rounded: "xl",
    $layout: "horizontal",
    $p: 1,
    $gap: "auto",
    $joined(defaultValue, variants) {
      return (
        defaultValue ??
        (variants.$layout === "horizontal" || variants.$layout === "stretch")
      );
    },
  },
  refine({ variants, addClass }) {
    if (!variants.$joined) return;
    if (
      variants.$layout !== "horizontal" &&
      variants.$layout !== "stretch" &&
      variants.$layout !== "vertical"
    ) {
      return;
    }
    if (variants.$gap !== "none" && variants.$gap !== "auto") return;
    // Resolve zero padding in any CSS unit. Wrapped rows have no adjacency
    // contract.
    if (variants.$gap === "none") {
      addClass("ak-frame-join");
    } else {
      addClass("ak-frame-join ak-frame-join-auto");
    }
    addClass(variants.$layout === "vertical" ? "ak-frame-col" : "ak-frame-row");
    // Ignore separators and hidden controls when finding the first and last
    // controls.
    addClass([
      "[&>.ui-control:nth-child(1_of_.ui-control:not([hidden]))]:ak-frame-start",
      "[&>.ui-control:nth-last-child(1_of_.ui-control:not([hidden]))]:ak-frame-end",
    ]);
  },
});
