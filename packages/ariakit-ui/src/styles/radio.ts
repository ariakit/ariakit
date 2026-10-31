import { cv } from "clava";
import {
  choiceCard,
  choiceCardCheck,
  choiceCardContent,
  choiceCardDescription,
  choiceCardGrid,
  choiceCardLabel,
  choiceCardLabelRow,
  choiceCardSlot,
  choiceField,
  choiceFieldContent,
  choiceFieldDescription,
  choiceFieldLabel,
  choiceInput,
} from "./choice.ts";
import { text } from "./text.ts";

/** A native radio input with a circular mark and keyboard focus ring. */
export const radio = cv({
  extend: [choiceInput],
  defaultVariants: {
    $mark: "dot",
    // Keep the radio round inside a parent frame.
    $rounded: "full",
  },
});

/** A radio field with aligned input, label, and description. */
export const radioField = cv({
  extend: [choiceField],
});

/** Arranges a radio field's label and description. */
export const radioContent = choiceFieldContent;

/** Radio label text with optional truncation. */
export const radioLabel = choiceFieldLabel;

/** Secondary text for a radio field. */
export const radioDescription = choiceFieldDescription;

/** A selectable card for a radio input and its content. */
export const radioCard = cv({
  extend: [choiceCard],
});

/**
 * A circular selection mark for a radio card. It draws a dot, or a check when
 * floating.
 */
export const radioCardCheck = cv({
  extend: [choiceCardCheck],
  defaultVariants: {
    $mark(_defaultValue, variants) {
      // A floating mark is a badge on the card's corner. Like a checkbox
      // card's, it draws a check.
      if (variants.$floating) return "check";
      return "dot";
    },
  },
});

/** A radio card slot for an icon, avatar, badge, or shortcut. */
export const radioCardSlot = choiceCardSlot;

/** Arranges a radio card's label and description. */
export const radioCardContent = choiceCardContent;

/**
 * A row in a radio card's content for the label and the slots that go with it,
 * such as a badge. The description takes the full width below the row.
 */
export const radioCardLabelRow = choiceCardLabelRow;

/** Primary label text for a radio card. */
export const radioCardLabel = choiceCardLabel;

/** Secondary text for a radio card. */
export const radioCardDescription = choiceCardDescription;

/**
 * Visible label of a radio group, placed first in the group. It takes a full
 * row when the group is a grid.
 */
export const radioGroupLabel = cv({
  extend: [text],
  class: [
    // :where() lets caller font classes win.
    "radio-group-label [:where(&)]:text-[0.875em] [:where(&)]:font-medium",
    "col-span-full",
    "in-aria-disabled:ak-ink-0",
    "in-aria-disabled:forced-colors:text-[GrayText]",
  ],
});

/** A responsive grid of radio cards. */
export const radioCardGrid = cv({
  extend: [choiceCardGrid],
  // The grid makes its rows equal. Size a label row to the label instead, so
  // the cards keep their own height.
  class: "has-[>.radio-group-label]:grid-rows-[auto]",
});
