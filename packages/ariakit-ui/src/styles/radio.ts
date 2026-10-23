import { cv } from "clava";
import {
  choiceCard,
  choiceCardCheck,
  choiceCardContent,
  choiceCardDescription,
  choiceCardGrid,
  choiceCardLabel,
  choiceCardSlot,
  choiceField,
  choiceFieldContent,
  choiceFieldDescription,
  choiceFieldLabel,
  choiceInput,
} from "./choice.ts";

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

/** A circular selection mark for a radio card. */
export const radioCardCheck = cv({
  extend: [choiceCardCheck],
  defaultVariants: {
    $mark: "dot",
    $rounded: "full",
  },
});

/** A radio card slot for an icon, avatar, badge, or shortcut. */
export const radioCardSlot = choiceCardSlot;

/** Arranges a radio card's label and description. */
export const radioCardContent = choiceCardContent;

/** Primary label text for a radio card. */
export const radioCardLabel = choiceCardLabel;

/** Secondary text for a radio card. */
export const radioCardDescription = choiceCardDescription;

/** A responsive grid of radio cards. */
export const radioCardGrid = choiceCardGrid;
