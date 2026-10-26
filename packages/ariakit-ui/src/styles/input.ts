import { cv } from "clava";
import {
  control,
  controlField,
  controlFieldContent,
  controlFieldGrid,
  controlFieldDescription,
  controlFieldError,
  controlFieldLabel,
  controlSlot,
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
    "max-w-full cursor-text items-center justify-start",
    inputInvalidEdge,
    // Animate hover entry only to avoid a delayed exit.
    "hover:transition-[background-color]",
    // Use ordinary hover because ui-hover excludes nested controls. Apply the
    // field's disabled condition explicitly.
    "not-ui-field-disabled:hover:ak-state-2.5",
    // Read disabled state from DOM entry controls, including updates after
    // render. Enabled entries or a disabled action button keep the field
    // enabled. The plugin's zero-lighten utility cancels the inline default.
    "ui-field-disabled:ak-disabled",
    "ui-field-disabled:cursor-not-allowed **:ui-disabled:cursor-not-allowed",
    // Skip the descendant ink in forced colors: an icon gets the system color
    // only while its color inherits.
    "ui-field-disabled:ak-ink-0 ui-field-disabled:not-forced-colors:**:ak-ink-0",
    "ui-field-disabled:ak-edge-10",
    "ui-field-disabled:ak-layer-lighten-0",
    // Drop the chroma cap too, or a field on a tinted layer stays
    // nearly white instead of matching the surface around it.
    "ui-field-disabled:ak-layer-max-c-[initial]",
    // Forced colors replace the ink and edge with the normal text color. Use
    // the system disabled color instead. An enabled action button and its
    // content keep their system colors, so the button does not look disabled:
    // the descendant rule leaves them out, and the last rule stops the button
    // from inheriting the field's color.
    "ui-field-disabled:forced-colors:text-[GrayText]",
    "ui-field-disabled:forced-colors:[&_*:not(:is(button,input,a):not(:disabled,[aria-disabled='true']),:is(button,input,a):not(:disabled,[aria-disabled='true'])_*)]:text-[GrayText]",
    "ui-field-disabled:forced-colors:border-[GrayText]",
    "ui-field-disabled:forced-colors:[&_:is(button,input,a):not(:disabled,[aria-disabled='true'])]:[color:revert]",
    // A native input uses the control line box; a textarea keeps its rows.
    "[input]:box-content [input]:h-lh",
    "[&_input]:box-content [&_input]:h-lh",
    // Entry controls share the wrapper's focus ring; action buttons keep
    // theirs. :where() prevents higher specificity from type exclusions.
    "[&_:is(input:not(:where([type=hidden],[type=button],[type=submit],[type=reset],[type=image],[type=checkbox],[type=radio])),textarea,select)]:outline-none",
    "placeholder:ak-ink-0 [&_:is(input,textarea)]:placeholder:ak-ink-0",
    // Nested fields use the outer geometry; ! also overrides their focus-state
    // ring.
    "[:is(&_&)]:p-0 [:is(&_&)]:border-0 [:is(&_&)]:ring-0",
    "[:is(&_&)]:shadow-none [:is(&_&)]:outline-none!",
    "[:is(&_&)]:bg-transparent [:is(&_&)]:ak-layer-lighten-0 [:is(&_&)]:ak-state-0",
    // Nested fields have no padding, so a concentric radius would clip the
    // caret and text at their start. The outer field draws the shape.
    "[:is(&_&)]:rounded-none",
    // Nested fields fill the free space beside the slots and can shrink below
    // the native width that a flex item keeps by default. :where() lets
    // callers give one a fixed width with flex-none.
    "[:is(&_&)]:min-w-0 [:where(&_&)]:flex-1",
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
      true: [
        // :where() lets callers set a width, such as a minimum for the value.
        "field-sizing-content [:where(&:not(textarea))]:w-fit",
        // Entry controls in a group stop filling the free space, so the group
        // fits them. Browsers without field sizing keep the native width.
        "[&_:is(input,textarea)]:field-sizing-content [&_:is(input,textarea)]:flex-initial",
      ],
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
    // Lose chroma as the lightened surface nears white, so a field on a tinted
    // light layer reads white instead of a brighter tint of that layer.
    $chromaMax: "auto",
    $edgeRaw: getInputEdgeRaw,
    $focus: true,
    $focusOffset: "inset",
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

/** Error text for an input. */
export const inputError = controlFieldError;

/** Placeholder-colored text for an empty control styled as an input. */
export const inputPlaceholder = cv({
  class: "ak-ink-0",
});
