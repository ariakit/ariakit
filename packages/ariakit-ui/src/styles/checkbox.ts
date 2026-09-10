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

/**
 * A native checkbox drawn by CSS: the choice box with a check, a dash in the
 * mixed state, and the keyboard focus ring.
 */
export const checkbox = cv({
  extend: [choiceInput],
});

export const checkboxField = cv({
  extend: [choiceField],
});

export const checkboxContent = choiceFieldContent;

export const checkboxLabel = choiceFieldLabel;

export const checkboxDescription = choiceFieldDescription;

export const checkboxCard = cv({
  extend: [choiceCard],
});

export const checkboxCardCheck = cv({
  extend: [choiceCardCheck],
});

export const checkboxCardSlot = choiceCardSlot;

export const checkboxCardContent = choiceCardContent;

export const checkboxCardLabel = choiceCardLabel;

export const checkboxCardDescription = choiceCardDescription;

export const checkboxCardGrid = choiceCardGrid;
