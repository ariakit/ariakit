import { cv } from "clava";
import { control, controlSlot } from "./control.ts";
import { focusHighlight } from "./focus.ts";

/** A text field or field wrapper with focus, invalid, and disabled styles. */
export const input = cv({
  extend: [control, focusHighlight],
  class: [
    "max-w-full cursor-text items-center justify-start",
    // Preserve the danger hue and override the ordinary edge weight.
    "not-ui-field-disabled:ui-field-invalid:ak-edge-danger not-ui-field-disabled:ui-field-invalid:ak-edge-45",
    "not-ui-field-disabled:ui-field-invalid:ak-edge-push-0",
    // Animate hover entry only to avoid a delayed exit.
    "hover:transition-[background-color]",
    // Use ordinary hover because ui-hover excludes nested controls. Apply the
    // field's disabled condition explicitly.
    "not-ui-field-disabled:hover:ak-state-2.5",
    // Read disabled state from DOM entry controls, including updates after
    // render. Enabled entries or a disabled action button keep the field
    // enabled. The plugin's zero-offset utility cancels the inline default.
    "ui-field-disabled:ak-disabled",
    "ui-field-disabled:cursor-not-allowed **:ui-disabled:cursor-not-allowed",
    // Skip the descendant ink in forced colors: an icon gets the system color
    // only while its color inherits.
    "ui-field-disabled:ak-ink-0 ui-field-disabled:not-forced-colors:**:ak-ink-0",
    "ui-field-disabled:ak-edge-10",
    "ui-field-disabled:ak-layer-offset-0",
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
    "[:is(&_&)]:bg-transparent [:is(&_&)]:ak-layer-offset-0 [:is(&_&)]:ak-state-0",
  ],
  variants: {
    /**
     * Disables the inherited variant; the field's DOM state controls its
     * disabled appearance.
     */
    $disabled: null,
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
  },
  defaultVariants: {
    $rounded: "lg",
    $border: true,
    $borderType: "border",
    // Match choice boxes at 3:1 boundary contrast. A variant default lets
    // callers replace this weight.
    $edgeWeight: 45,
    // Keep writing surfaces lighter on light layers and darker on dark layers.
    $lightnessOffset: -1,
    $focus: true,
    $focusOffset: "inset",
  },
});

/** A text-aligned slot for field icons and other content. */
export const inputSlot = controlSlot;

/** Placeholder-colored text for an empty control styled as an input. */
export const inputPlaceholder = cv({
  class: "ak-ink-0",
});
