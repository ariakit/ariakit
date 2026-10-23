import { cv } from "clava";
import {
  choiceCard,
  choiceCardCheck,
  choiceCardContent,
  choiceCardDescription,
  choiceCardGrid,
  choiceCardLabel,
  choiceCardShortcut,
  choiceCardSlot,
  choiceField,
  choiceFieldContent,
  choiceFieldDescription,
  choiceFieldLabel,
  choiceInput,
} from "./choice.ts";

/**
 * A native checkbox with a check mark, mixed-state dash, and keyboard focus
 * ring.
 */
export const checkbox = cv({
  extend: [choiceInput],
});

/** A label row for a checkbox and its description. */
export const checkboxField = cv({
  extend: [choiceField],
});

/** A flexible wrapper for a checkbox's label and description. */
export const checkboxContent = choiceFieldContent;

/** Checkbox label text with optional truncation. */
export const checkboxLabel = choiceFieldLabel;

/** Secondary checkbox text with optional line limits. */
export const checkboxDescription = choiceFieldDescription;

/** A selectable card whose state follows a nested checkbox. */
export const checkboxCard = cv({
  extend: [choiceCard],
});

/** A check indicator whose state follows its card's checkbox. */
export const checkboxCardCheck = cv({
  extend: [choiceCardCheck],
});

/** A text-aligned slot for checkbox card icons and other content. */
export const checkboxCardSlot = choiceCardSlot;

/** A keyboard shortcut beside a checkbox card label. */
export const checkboxCardShortcut = choiceCardShortcut;

/** A flexible wrapper for a checkbox card's label and description. */
export const checkboxCardContent = choiceCardContent;

/** A checkbox card label that fills the space between its slots. */
export const checkboxCardLabel = choiceCardLabel;

/** Secondary checkbox card text that truncates by default. */
export const checkboxCardDescription = choiceCardDescription;

/** A responsive grid of checkbox cards with equal row heights. */
export const checkboxCardGrid = choiceCardGrid;
