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
  choiceGroup,
  choiceGroupDescription,
  choiceGroupLabel,
  choiceInput,
  choiceList,
} from "./choice.ts";

/** A native radio input with a circular mark and keyboard focus ring. */
export const radio = cv({
  extend: [choiceInput],
  variants: {
    // A click can't turn a radio off, so it can't look like a switch.
    $mark: { switch: null },
  },
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
  variants: {
    // A click can't turn a radio off, so it can't look like a switch.
    $mark: { switch: null },
  },
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
 * A radio group that stacks its label, its description, its radios, and an
 * error with the group gap.
 */
export const radioGroup = choiceGroup;

/** Visible label of a radio group, placed first in the group. */
export const radioGroupLabel = choiceGroupLabel;

/** Secondary text of a radio group, close under its label. */
export const radioGroupDescription = choiceGroupDescription;

/** Stacks the radio fields or cards of a radio group. It adds no role. */
export const radioList = choiceList;

/** A responsive grid of radio cards with equal row heights. */
export const radioCardGrid = choiceCardGrid;
