import { cv } from "clava";
import {
  control,
  controlField,
  controlFieldContent,
  controlFieldGrid,
  controlFieldDescription,
  controlFieldError,
  controlFieldErrorIcon,
  controlFieldErrorText,
  controlFieldLabel,
  controlSlot,
  fadesDisabledSurface,
} from "./control.ts";
import { focusHighlight } from "./focus.ts";

/**
 * Shows the danger color at full strength instead of the field's alpha while
 * the field or an entry control in it has `aria-invalid`.
 */
export const inputInvalidEdge =
  "not-ui-field-disabled:ui-field-invalid:ak-edge-danger not-ui-field-disabled:ui-field-invalid:ak-edge-raw";

/**
 * Resolves the `$edgeRaw` default of a field, so a chosen `$edge` color shows
 * at full strength, like the invalid edge, instead of at the neutral edge
 * alpha. The contrast floor still moves its lightness when it is under 3:1.
 */
export function getInputEdgeRaw(
  defaultValue: boolean | undefined,
  variants: { $edge?: unknown },
) {
  if (defaultValue != null) return defaultValue;
  if (variants.$edge == null) return defaultValue;
  if (variants.$edge === "unset") return defaultValue;
  return true;
}

/** A text field or field wrapper with focus, invalid, and disabled styles. */
export const input = cv({
  extend: [control, focusHighlight],
  class: [
    "ui-input",
    inputInvalidEdge,
    // Forced colors replace the ink and edge with the normal text color. Use
    // the system disabled color instead. An enabled action button and its
    // content keep their system colors, so the button does not look disabled:
    // the descendant rule leaves them out, and the last rule stops the button
    // from inheriting the field's color.
    // Stays a class to come after the classes of a caller, so that the forced
    // colors rule still applies.
    "ui-field-disabled:forced-colors:text-[GrayText]",
    "forced-colors:[@container_style(--field-disabled:1)]:[&&&&&_*:not(:is(button,input,a):not(:disabled,[aria-disabled='true']),:is(button,input,a):not(:disabled,[aria-disabled='true'])_*)]:text-[GrayText]",
    "ui-field-disabled:forced-colors:border-[GrayText]",
    "ui-field-disabled:forced-colors:[&_:is(button,input,a):not(:disabled,[aria-disabled='true'])]:text-[revert]",
  ],
  variants: {
    /**
     * Disables the inherited variant; the field's DOM state controls its
     * disabled appearance.
     */
    $disabled: null,
    /**
     * Keeps the field edge at 3:1 or more against the surface around it, as
     * WCAG asks for the boundary of a control. With the default push, a neutral
     * edge raises its opacity. A neutral edge with `$edgeRaw` or a smaller
     * `$edgePush` keeps its color and can stay under the floor. An edge with a
     * color becomes solid and moves its lightness toward the floor. High
     * contrast mode raises the floor to 4.5:1, and disabled fields lower it. A
     * lighter `$edgeWeight` doesn't go under the floor, so turn the floor off
     * for a lighter edge. A field nested in another field with the floor draws
     * no edge, so it skips the floor and its style cost.
     */
    $edgeContrast(value?: boolean) {
      if (!value) return;
      // A function replaces the inherited class instead of adding to it.
      return "[&:not(:is(&_&))]:ak-edge-contrast";
    },
    /**
     * Whether to show a focus ring when the field, or the input inside it,
     * takes focus, and how thick the ring should be.
     */
    $focus(value?: 1 | 2 | 3 | boolean) {
      if (!value) return;
      // Replace inherited focus classes. focus-within covers wrappers and
      // pointer focus on button-based fields.
      if (value === 1) return "focus-within:outline";
      if (value === 3) return "focus-within:outline-3";
      return "focus-within:outline-2";
    },
    /**
     * Extends the focus ring offsets with `inset`, which tucks the ring inside
     * the border so the two read as a single edge.
     */
    $focusOffset: {
      inset: "-outline-offset-1",
    },
    /**
     * Sizes the field to its value with `field-sizing: content`, so it grows
     * and shrinks as people type. An empty field fits its placeholder. In a
     * field, a group, or a grid, a textarea keeps the width of its column and
     * grows in height. Elsewhere, give the textarea a width. On a group, the
     * group fits its slots and the entry controls in it.
     */
    $fitContent: {
      true: "ui-input--fit-content-true",
      false: "",
    },
  },
  defaultVariants: {
    $rounded: "lg",
    $border: true,
    $borderType: "border",
    // Keep the field boundary at 3:1 against the surface around it, like choice
    // boxes. A variant default lets callers turn it off.
    $edgeContrast: true,
    // Raise the writing surface like other materials above their support: white
    // on light layers and lighter on dark layers, never a dark well.
    $lighten: true,
    $edgeRaw: getInputEdgeRaw,
    $focus: true,
    $focusOffset: "inset",
  },
  refine({ variants, addClass }) {
    // Fade the field while its entry controls are disabled, as control does for
    // $disabled.
    if (!fadesDisabledSurface(variants)) return;
    addClass("ui-field-disabled:ak-layer-fade-80");
  },
});

/** A text-aligned slot for field icons and other content. */
export const inputSlot = controlSlot;

/** A field that lays out an input label, the input, and the input's texts. */
export const inputField = controlField;

/** Holds an input and its texts in the second column of a horizontal field. */
export const inputFieldContent = controlFieldContent;

/** Lines up horizontal input fields in shared label and content columns. */
export const inputFieldGrid = controlFieldGrid;

/** Label text above or beside an input. */
export const inputLabel = controlFieldLabel;

/** Hint text for an input. */
export const inputDescription = controlFieldDescription;

/**
 * Error text for an input. Put the text in an `inputErrorText` part, and put an
 * `inputErrorIcon` part before it to mark the error with an icon. Frame
 * variants show the error on a panel.
 */
export const inputError = controlFieldError;

/**
 * An icon before the text of an input error, centered on its first line. Put it
 * first in the error, and hide it from assistive technology.
 */
export const inputErrorIcon = controlFieldErrorIcon;

/**
 * The text of an input error. It takes the danger color, also on a colored
 * panel.
 */
export const inputErrorText = controlFieldErrorText;

/** Placeholder-colored text for an empty control styled as an input. */
export const inputPlaceholder = cv({
  class: "ak-ink-0",
});
